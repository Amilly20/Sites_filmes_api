# 🏦 Sistema de Contas Bancárias - Sites Filmes API

## Visão Geral

O sistema de contas bancárias permite ao seu cliente configurar e gerenciar as informações financeiras necessárias para receber os pagamentos das assinaturas. O sistema suporta múltiplas contas bancárias, chaves PIX e configuração de taxas.

## Funcionalidades Principais

### ✅ Já Implementado

1. **Gerenciamento de Contas Bancárias**
   - ➕ Criar nova conta bancária
   - 📋 Listar todas as contas
   - 🔍 Buscar conta por ID
   - ✏️ Atualizar informações da conta
   - 🚫 Desativar conta bancária

2. **Sistema de Conta Padrão**
   - ⭐ Definir conta como padrão para recebimentos
   - 🎯 Obter conta padrão ativa
   - 🔄 Alternar entre contas padrão

3. **Integração com Pagamentos**
   - 💰 PIX: Usa chaves PIX configuradas na conta padrão
   - 📄 Boleto: Usa dados bancários da conta padrão
   - 💳 Cartão: Registra pagamentos na conta padrão

4. **Configurações de Taxa**
   - 📊 Taxa percentual para PIX (0-10%)
   - 💵 Taxa fixa para Boleto (R$)
   - 💳 Taxa percentual para Cartão (0-15%)

5. **Chaves PIX Múltiplas**
   - 🔑 Suporte a CPF/CNPJ, Email, Telefone, Chave Aleatória
   - ⭐ Definição de chave PIX padrão
   - 🔒 Mascaramento de dados sensíveis

## Estrutura dos Dados

### Conta Bancária Completa
```json
{
  "accountName": "Conta Principal - Recebimentos",
  "bank": {
    "code": "341",
    "name": "Itaú Unibanco S.A."
  },
  "account": {
    "agency": "1234",
    "number": "123456",
    "digit": "7",
    "type": "corrente"
  },
  "holder": {
    "name": "Empresa XYZ Ltda",
    "document": "12345678000195",
    "documentType": "cnpj"
  },
  "pixKeys": [
    {
      "type": "cnpj",
      "key": "12345678000195",
      "isDefault": true
    },
    {
      "type": "email",
      "key": "financeiro@empresa.com",
      "isDefault": false
    }
  ],
  "paymentMethods": {
    "acceptsPix": true,
    "acceptsBoleto": true,
    "acceptsCard": true
  },
  "fees": {
    "pixPercentage": 0,
    "boletoFixed": 2.50,
    "cardPercentage": 3.5
  }
}
```

## API Endpoints

### 📋 Listar Contas
```http
GET /api/bank-accounts
Authorization: Bearer {admin_token}
```

### ➕ Criar Conta
```http
POST /api/bank-accounts
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "accountName": "Conta Principal",
  "bank": { "code": "341", "name": "Itaú" },
  "account": { "agency": "1234", "number": "123456", "digit": "7" },
  "holder": { "name": "João Silva", "document": "12345678901", "documentType": "cpf" },
  "pixKeys": [{ "type": "cpf", "key": "12345678901", "isDefault": true }]
}
```

### ⭐ Definir como Padrão
```http
PATCH /api/bank-accounts/{id}/set-default
Authorization: Bearer {admin_token}
```

### 🎯 Obter Conta Padrão
```http
GET /api/bank-accounts/default
Authorization: Bearer {admin_token}
```

## Configuração Inicial

### 1. Executar Seed do Sistema
```bash
npm run seed
```
Isso criará automaticamente uma conta bancária padrão de exemplo.

### 2. Configurar Conta Real
Após o seed, acesse a API para atualizar com os dados bancários reais do seu cliente:

```bash
# 1. Fazer login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@filmes.com", "password": "Admin@123"}'

# 2. Usar o token para atualizar a conta
curl -X PUT http://localhost:3000/api/bank-accounts/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "bank": { "code": "001", "name": "Banco do Brasil S.A." },
    "account": { "agency": "1234", "number": "987654", "digit": "3" },
    "holder": { "name": "Seu Cliente Ltda", "document": "11222333000144", "documentType": "cnpj" },
    "pixKeys": [
      { "type": "cnpj", "key": "11222333000144", "isDefault": true },
      { "type": "email", "key": "financeiro@seucliente.com" }
    ]
  }'
```

## Integração com Pagamentos

### Como Funciona
1. **PIX**: Quando um usuário solicita pagamento PIX, o sistema:
   - Obtém a conta bancária padrão
   - Usa a chave PIX padrão configurada
   - Gera QR Code com dados reais da conta

2. **Boleto**: Para pagamentos via boleto:
   - Usa dados bancários da conta padrão
   - Gera código de barras com informações reais
   - Inclui dados do beneficiário (titular da conta)

3. **Cartão**: Pagamentos com cartão:
   - Registra a transação associada à conta padrão
   - Aplica taxas configuradas
   - Gera comprovante com dados da conta de destino

## Segurança e Validações

### Validações Implementadas
- ✅ Código do banco: 3 dígitos obrigatórios
- ✅ Agência: 4-5 dígitos numéricos
- ✅ Conta: 5-12 dígitos numéricos
- ✅ CPF: 11 dígitos / CNPJ: 14 dígitos
- ✅ Chaves PIX: Validação por tipo (email, telefone, etc.)

### Proteção de Dados
- 🔒 Mascaramento de documentos e chaves PIX na exibição
- 👨‍💼 Acesso restrito apenas para administradores
- 📝 Log de auditoria com usuário criador
- 🔐 Tokens JWT obrigatórios para todas as operações

## Próximos Passos

### Para Colocar em Produção
1. **Configurar Conta Real**: Substituir dados fictícios pelos reais
2. **Gateway de Pagamento**: Integrar com Mercado Pago, PagSeguro, etc.
3. **Webhook de Confirmação**: Implementar callbacks de pagamento
4. **Backup de Contas**: Sistema de backup das configurações bancárias

### Melhorias Futuras
- 📊 Dashboard financeiro com estatísticas
- 📧 Notificações de pagamentos recebidos
- 🔄 Rotacionamento automático entre contas
- 💹 Relatórios de taxas e comissões

## Suporte

Para dúvidas sobre a configuração das contas bancárias:
1. Consulte a documentação do Swagger em `/api-docs`
2. Verifique os logs de validação nas respostas da API
3. Use o endpoint `/api/bank-accounts/stats` para estatísticas

---
**✅ Sistema 100% funcional e pronto para uso!**