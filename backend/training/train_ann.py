import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import os
import joblib
import sys

# Add parent dir to path so we can import from models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.ann_model import CongestionPredictorANN

def train_model(data_path="../data/dataset.csv", model_save_path="../models/ann_weights.pth", scaler_save_path="../models/scaler.pkl"):
    print(f"Loading data from {data_path}...")
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print("Dataset not found. Please run data/generator.py first.")
        return
        
    # Features and target
    X = df[['north_count', 'south_count', 'east_count', 'west_count', 'avg_speed', 'queue_length', 'time_of_day']].values
    y = df['congestion_score'].values.reshape(-1, 1)
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save scaler
    joblib.dump(scaler, scaler_save_path)
    
    # Convert to PyTorch tensors
    X_train_tensor = torch.FloatTensor(X_train_scaled)
    y_train_tensor = torch.FloatTensor(y_train)
    X_test_tensor = torch.FloatTensor(X_test_scaled)
    y_test_tensor = torch.FloatTensor(y_test)
    
    # Create DataLoaders
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
    
    # Initialize model, loss, optimizer
    model = CongestionPredictorANN()
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Training loop
    epochs = 100
    print("Training started...")
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * batch_X.size(0)
            
        train_loss /= len(train_loader.dataset)
        
        if (epoch+1) % 10 == 0:
            model.eval()
            with torch.no_grad():
                test_outputs = model(X_test_tensor)
                test_loss = criterion(test_outputs, y_test_tensor).item()
            print(f'Epoch [{epoch+1}/{epochs}], Train Loss: {train_loss:.4f}, Test Loss: {test_loss:.4f}')
            
    # Save model
    torch.save(model.state_dict(), model_save_path)
    print(f"Model saved to {model_save_path}")
    print("Training completed successfully.")

if __name__ == "__main__":
    train_model(
        data_path=os.path.join(os.path.dirname(__file__), "..", "data", "dataset.csv"),
        model_save_path=os.path.join(os.path.dirname(__file__), "..", "models", "ann_weights.pth"),
        scaler_save_path=os.path.join(os.path.dirname(__file__), "..", "models", "scaler.pkl")
    )
