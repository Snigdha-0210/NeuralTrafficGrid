import torch
import torch.nn as nn

class CongestionPredictorANN(nn.Module):
    def __init__(self, input_size=7, hidden1_size=16, hidden2_size=8, output_size=1):
        super(CongestionPredictorANN, self).__init__()
        
        self.layer1 = nn.Linear(input_size, hidden1_size)
        self.relu1 = nn.ReLU()
        
        self.layer2 = nn.Linear(hidden1_size, hidden2_size)
        self.relu2 = nn.ReLU()
        
        self.output_layer = nn.Linear(hidden2_size, output_size)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        x = self.layer1(x)
        x = self.relu1(x)
        
        x = self.layer2(x)
        x = self.relu2(x)
        
        x = self.output_layer(x)
        x = self.sigmoid(x)
        return x
