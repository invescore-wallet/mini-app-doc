/* eslint-disable no-undef */
window.Pocket = {
  eventListeners: {
    onGetTokenComplete: () => {
      throw new NotImplementedException('This method is not implemented.')
    },
    onGoBackComplete: () => {
      throw new NotImplementedException('This method is not implemented.')
    },
    onDeepLinkComplete: () => {
      throw new NotImplementedException('This method is not implemented.')
    },
    onOpenUrlComplete: () => {
      throw new NotImplementedException('This method is not implemented.')
    }
  },

  getToken(data, callback) {
    this.eventListeners.onGetTokenComplete = callback
    window.PocketMobile.postMessage(JSON.stringify({ action: 'getToken', data }))
  },

  goBack(data, callback) {
    this.eventListeners.onGoBackComplete = callback
    window.PocketMobile.postMessage(JSON.stringify({ action: 'getBack', data }))
  },

  callDeepLink(data, callback) {
    this.eventListeners.onDeepLinkComplete = callback
    window.PocketMobile.postMessage(JSON.stringify({ action: 'launchQpay', data }))
  },
  callOpenUrl(data, callback) {
    this.eventListeners.onOpenUrlComplete = callback
    window.PocketMobile.postMessage(JSON.stringify({ action: 'openLink', data }))
  }
}

