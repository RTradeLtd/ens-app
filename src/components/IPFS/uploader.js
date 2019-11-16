import React, { Component } from 'react'
import { Title } from '../Typography/Basic'
import TopBar from '../Basic/TopBar'
import styled from '@emotion/styled'
import NameContainer from '../Basic/MainContainer'
import Button from '../Forms/Button'
import DefaultInput from '../Forms/Input'
import mq from 'mediaQuery'

var ipfsClient = require('ipfs-http-client')
const Input = styled(DefaultInput)`
  width: 20%;
  margin-top: 20px;
  margin-right: 20px;
  margin-left: 20px;
  margin-bottom: 20px;
  ${mq.small`
    margin-bottom: 20px;
  `}
`
const RightBar = styled('div')`
  display: flex;
  align-items: center;
`

// Uploader is a generalized ipfs upload capable of uploading
// and interacting with an IPFS HTTP API
class Uploader {
  // initializes the ipfs uploader class
  constructor(userOpts) {
    this.ipfsapi = ipfsClient({
      // the hostname (or ip address) of the endpoint providing the ipfs api
      host: userOpts.host,
      // the port to connect on
      port: userOpts.port,
      'api-path': userOpts.apiPath,
      // the protocol, https for security
      protocol: userOpts.protocol,
      headers: userOpts.headers
      // provide the jwt within an authorization header
    })
  }
  // pins a given hash
  pinHash(hash) {
    this.ipfsapi.pin.add(hash, function(err, response) {
      if (err) {
        console.error(err, err.stack)
      } else {
        console.log(response)
      }
    })
  }
  // TODO(postables): add a call to upload files
}

class IPFSUploader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      host: 'https://dev.api.ipfs.temporal.cloud',
      port: '443',
      apiPath: '/api/v0',
      protocol: '443',
      headers: {},
      hash: ''
    }
  }

  pinHash() {
    const upl = new Uploader({
      host: this.state.host,
      port: this.state.port,
      'api-path': this.state.apiPath,
      headers: this.state.headers
    })
    upl.pinHash(this.state.hash)
  }
  updateHash(e) {
    this.setState({ hash: e.target.value })
  }
  render() {
    return (
      <NameContainer>
        <TopBar>
          <Title>IPFS Uploader</Title>
          <RightBar>
            Upload files or pin content to IPFS through different IPFS providers
          </RightBar>
        </TopBar>
        <Input
          value={this.state.hash}
          onChange={this.updateHash.bind(this)}
          placeholder="enter hash to pin"
          large
        />
        <Button onClick={this.pinHash.bind(this)}>Pin Hash</Button>
      </NameContainer>
    )
  }
}

export default IPFSUploader

/* How to use:

const jwt = process.env.TEMPORAL_JWT;
const upl = new Uploader({
    // the hostname (or ip address) of the endpoint providing the ipfs api
    host: 'api.ipfs.temporal.cloud',
    // the port to connect on
    port: '443',
    apiPath: '/api/v0/',
    // the protocol, https for security
    protocol: 'https',
    // provide the jwt within an authorization header
    headers: {
        authorization: 'Bearer ' + jwt,
    }
});

upl.pinHash('QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv')
*/
