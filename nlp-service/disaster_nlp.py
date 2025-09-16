import pandas as pd
import numpy as np
import re
import string
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.callbacks import EarlyStopping
import pickle

class DisasterNLP:
    def __init__(self, max_words=10000, max_sequence_length=50):
        self.max_words = max_words
        self.max_sequence_length = max_sequence_length
        self.tokenizer = Tokenizer(num_words=max_words, oov_token="<OOV>")
        self.model = None
        self.is_fitted = False
        
    def preprocess_text(self, text):
        """
        Preprocess text by lowercasing, removing URLs, mentions, and punctuation
        """
        if not isinstance(text, str):
            return ""
            
        # Lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove user mentions
        text = re.sub(r'@\w+', '', text)
        
        # Remove punctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Remove numbers
        text = re.sub(r'\d+', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def prepare_data(self, texts, labels=None, training=False):
        """
        Prepare text data for model training or prediction
        """
        processed_texts = [self.preprocess_text(text) for text in texts]
        
        if training:
            self.tokenizer.fit_on_texts(processed_texts)
            self.is_fitted = True
            
        sequences = self.tokenizer.texts_to_sequences(processed_texts)
        padded_sequences = pad_sequences(sequences, maxlen=self.max_sequence_length, padding='post', truncating='post')
        
        if labels is not None:
            return padded_sequences, np.array(labels)
        return padded_sequences
    
    def build_model(self):
        """
        Build the NLP model architecture
        """
        self.model = Sequential([
            Embedding(self.max_words, 100, input_length=self.max_sequence_length),
            Bidirectional(LSTM(64, return_sequences=True)),
            Dropout(0.5),
            Bidirectional(LSTM(32)),
            Dropout(0.5),
            Dense(24, activation='relu'),
            Dropout(0.5),
            Dense(1, activation='sigmoid')
        ])
        
        self.model.compile(
            loss='binary_crossentropy',
            optimizer='adam',
            metrics=['accuracy']
        )
        
        return self.model
    
    def train(self, texts, labels, validation_split=0.2, epochs=20, batch_size=32):
        """
        Train the NLP model
        """
        X, y = self.prepare_data(texts, labels, training=True)
        
        # Build model if not already built
        if self.model is None:
            self.build_model()
        
        early_stopping = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
        
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=[early_stopping],
            verbose=1
        )
        
        return history
    
    def predict(self, texts, threshold=0.5):
        """
        Predict if texts are disaster-related
        """
        if not self.is_fitted:
            raise ValueError("Model must be trained before prediction")
            
        X = self.prepare_data(texts)
        predictions = self.model.predict(X)
        
        # Apply threshold to get binary classification
        binary_predictions = (predictions >= threshold).astype(int)
        
        return {
            'predictions': binary_predictions.flatten(),
            'probabilities': predictions.flatten(),
            'is_disaster_related': binary_predictions.flatten().tolist()
        }
    
    def save_model(self, model_path='disaster_nlp_model.h5', tokenizer_path='tokenizer.pickle'):
        """
        Save model and tokenizer
        """
        if self.model is not None:
            self.model.save(model_path)
            
        with open(tokenizer_path, 'wb') as handle:
            pickle.dump(self.tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)
    
    def load_model(self, model_path='disaster_nlp_model.h5', tokenizer_path='tokenizer.pickle'):
        """
        Load model and tokenizer
        """
        self.model = tf.keras.models.load_model(model_path)
        
        with open(tokenizer_path, 'rb') as handle:
            self.tokenizer = pickle.load(handle)
        
        self.is_fitted = True

# Example usage
if __name__ == "__main__":
    # Sample training data (in practice, would use larger dataset)
    train_texts = [
        "Flood warning issued for coastal areas due to heavy rainfall",
        "Just had a great day at the beach, weather was perfect",
        "Tsunami alert after magnitude 8.0 earthquake",
        "Looking forward to the weekend getaway to the coast",
        "Coastal erosion threatening homes along the shoreline",
        "Beautiful sunset over the ocean today"
    ]
    
    train_labels = [1, 0, 1, 0, 1, 0]  # 1 = disaster, 0 = not disaster
    
    # Initialize and train model
    nlp_model = DisasterNLP()
    nlp_model.build_model()
    nlp_model.train(train_texts, train_labels)
    
    # Test prediction
    test_texts = [
        "High waves causing flooding in low-lying areas",
        "Enjoying a peaceful day by the sea"
    ]
    
    predictions = nlp_model.predict(test_texts)
    print(predictions)