import React, { Component } from 'react';
import { connect } from 'react-redux';
import { newWallet, generating } from '../modules/generateWallet';
import { Link } from 'react-router';
import WalletInfo from './WalletInfo.js';
import QRCode from 'qrcode';
import { clipboard } from 'electron';
import Copy from 'react-icons/lib/md/content-copy';
import ReactTooltip from 'react-tooltip';
import DisplayWalletKeys from './DisplayWalletKeys';
import { generateEncryptedWif } from '../util/Passphrase';
import { sendEvent, clearTransactionEvent } from '../modules/transactions';

let passphrase;

// TODO: move to neon-js
// what is the correct length to check for?
const validatePassphrase = (passphrase) => {
  return passphrase.length >= 4;
};

const generateNewWallet = (dispatch) => {
  const current_phrase = passphrase.value;
  if (validatePassphrase(current_phrase)){
    // TODO: for some reason this blocks, so giving time to processes the earlier
    // dispatch to display "generating" text, should fix this in future
    dispatch(sendEvent(true, "Generating encoded key..."));
    setTimeout(() => {
      generateEncryptedWif(current_phrase).then((result) => {
        dispatch(newWallet(result));
        dispatch(clearTransactionEvent());
      });
    }, 500);
  }
  else {
    dispatch(sendEvent(false, "Please choose a longer passphrase"));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    passphrase.value = '';
  }
}

class CreateWallet extends Component {

  render = () => {
    const passphraseDiv = (<div>
        <div className="info">
          Choose a passphrase to encrypt your private key:
        </div>
        <input type="text" ref={(node) => passphrase = node} placeholder="enter passphrase here"/>
        <button onClick={() => generateNewWallet(this.props.dispatch)} > Generate keys </button>
      </div>);
      return (<div id="newWallet">
        {this.props.wif === null ? passphraseDiv : <div></div>}
        {this.props.generating === true ? <div className="generating">Generating keys...</div> : <div></div>}
        {this.props.generating === false && this.props.wif !== null ? <DisplayWalletKeys address={this.props.address} wif={this.props.wif} passphrase={this.props.passphrase} passphraseKey={this.props.encryptedWif} /> : <div></div>}
      </div>)
  }

}

const mapStateToProps = (state) => ({
  wif: state.generateWallet.wif,
  address: state.generateWallet.address,
  encryptedWif: state.generateWallet.encryptedWif,
  passphrase: state.generateWallet.passphrase,
  generating: state.generateWallet.generating
});

CreateWallet = connect(mapStateToProps)(CreateWallet);

export default CreateWallet;
