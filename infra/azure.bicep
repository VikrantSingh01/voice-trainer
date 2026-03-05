param location string = resourceGroup().location
param appName string = 'voice-trainer'

// Azure Speech Service
resource speechService 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: '${appName}-speech'
  location: location
  kind: 'SpeechServices'
  sku: {
    name: 'F0' // Free tier
  }
  properties: {
    publicNetworkAccess: 'Enabled'
  }
}

// Azure OpenAI Service
resource openAIService 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: '${appName}-openai'
  location: location
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    customSubDomainName: '${appName}-openai'
  }
}

output speechServiceEndpoint string = speechService.properties.endpoint
output speechServiceKey string = speechService.listKeys().key1
output openAIServiceEndpoint string = openAIService.properties.endpoint
output openAIServiceKey string = openAIService.listKeys().key1
