param location string = resourceGroup().location
param appName string = 'voice-trainer'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
  kind: 'linux'
}

// App Service (Node.js backend + React static files)
resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: '${appName}-app'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        {
          name: 'AZURE_SPEECH_KEY'
          value: '' // Set after deployment
        }
        {
          name: 'AZURE_SPEECH_REGION'
          value: location
        }
        {
          name: 'AZURE_OPENAI_ENDPOINT'
          value: '' // Set after deployment
        }
        {
          name: 'AZURE_OPENAI_KEY'
          value: '' // Set after deployment
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
      ]
    }
  }
}

// Azure Speech Service
resource speechService 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: '${appName}-speech'
  location: location
  kind: 'SpeechServices'
  sku: {
    name: 'S0'
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
  }
}

output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output speechServiceEndpoint string = speechService.properties.endpoint
output openAIServiceEndpoint string = openAIService.properties.endpoint
