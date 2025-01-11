import type { ConnectLocale } from "./types.js";

const connectWalletLocalPtBr: ConnectLocale = {
  id: "pt_BR",
  signIn: "Entrar",
  defaultButtonTitle: "Conectar carteira",
  connecting: "Conectando",
  switchNetwork: "Trocar de rede",
  switchingNetwork: "Trocando de rede",
  defaultModalTitle: "Conectar",
  recommended: "Recomendado",
  installed: "Instalado",
  continueAsGuest: "Continuar como convidado",
  connectAWallet: "Conectar uma carteira",
  newToWallets: "Novo em carteiras?",
  getStarted: "Começar",
  guest: "Convidado",
  send: "Enviar",
  receive: "Receber",
  buy: "Comprar",
  transactions: "Transações",
  payTransactions: "Transações Fiat",
  walletTransactions: "Transações de Carteira",
  viewAllTransactions: "Ver todas as transações",
  currentNetwork: "Rede atual",
  switchAccount: "Trocar conta",
  requestTestnetFunds: "Solicitar fundos para Testnet",
  backupWallet: "Fazer backup da carteira",
  guestWalletWarning:
    "Esta é uma carteira de convidado temporária. Faça um backup se não quiser perder o acesso a ela",
  switchTo: "Trocar para",
  connectedToSmartWallet: "carteira inteligente",
  confirmInWallet: "Confirmar na carteira",
  disconnectWallet: "Desconectar carteira",
  copyAddress: "Copiar endereço",
  personalWallet: "Carteira pessoal",
  smartWallet: "Carteira inteligente",
  or: "Ou",
  goBackButton: "Voltar",
  passkeys: {
    title: "Chave de acesso",
    linkPasskey: "Vincular uma chave de acesso",
  },
  welcomeScreen: {
    defaultTitle: "Sua porta de entrada para o mundo descentralizado",
    defaultSubtitle: "Conecte uma carteira para começar",
  },
  agreement: {
    prefix: "Ao conectar, você aceita os",
    termsOfService: "Termos de serviço",
    and: "e",
    privacyPolicy: "Política de privacidade",
  },
  networkSelector: {
    title: "Selecionar rede",
    mainnets: "Redes principais",
    testnets: "Redes de teste",
    allNetworks: "Todas",
    addCustomNetwork: "Adicionar rede personalizada",
    inputPlaceholder: "Buscar rede ou ID da cadeia",
    categoryLabel: {
      recentlyUsed: "Usadas recentemente",
      popular: "Populares",
      others: "Outras redes",
    },
    loading: "Carregando",
    failedToSwitch: "Erro ao trocar de rede",
  },
  receiveFundsScreen: {
    title: "Receber fundos",
    instruction:
      "Copie o endereço da carteira para enviar fundos para esta carteira",
  },
  sendFundsScreen: {
    title: "Enviar fundos",
    submitButton: "Enviar",
    token: "Token",
    sendTo: "Enviar para",
    amount: "Quantidade",
    successMessage: "Transação bem-sucedida",
    invalidAddress: "Endereço inválido",
    noTokensFound: "Nenhum token encontrado",
    searchToken: "Buscar ou colar o endereço do token",
    transactionFailed: "Transação falhou",
    transactionRejected: "Transação rejeitada",
    insufficientFunds: "Fundos insuficientes",
    selectTokenTitle: "Selecione um Token",
    sending: "Enviando",
  },
  signatureScreen: {
    instructionScreen: {
      title: "Entrar",
      instruction:
        "Por favor, assine a solicitação de mensagem na sua carteira para continuar",
      signInButton: "Entrar",
      disconnectWallet: "Desconectar carteira",
    },
    signingScreen: {
      title: "Entrando",
      prompt: "Assine a solicitação de assinatura na sua carteira",
      promptForSafe:
        "Assine a solicitação de assinatura na sua carteira e aprove a transação no Safe",
      approveTransactionInSafe: "Aprovar transação no Safe",
      tryAgain: "Tentar novamente",
      failedToSignIn: "Erro ao entrar",
      inProgress: "Aguardando confirmação",
    },
  },
  manageWallet: {
    title: "Gerenciar Carteira",
    linkedProfiles: "Perfis vinculados",
    linkProfile: "Vincular um perfil",
    connectAnApp: "Conectar um Aplicativo",
    exportPrivateKey: "Exportar chave privada",
  },
  viewFunds: {
    title: "Ver Fundos",
    viewNFTs: "Ver NFTs",
    viewTokens: "Ver Tokens",
    viewAssets: "Ver Ativos",
  },
};

export default connectWalletLocalPtBr;
