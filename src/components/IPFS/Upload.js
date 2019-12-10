import React, { Component } from 'react'
import Dropzone from './Dropzone'
import styled from '@emotion/styled'
import Loading from './Loading'

var ipfsClient = require('ipfs-http-client')

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: flex-start;
  text-align: left;
  overflow: hidden;
`

const Name = styled('span')`
  margin-bottom: 32px;
  color: #555;
`

const FileName = styled('span')`
  margin-bottom: 8px;
  font-size: 16px;
  color: #555;
`

const Content = styled('div')`
  display: flex;
  flex-direction: row;
  padding-top: 16px;
  box-sizing: border-box;
  width: 100%;
`

const Files = styled('div')`
  margin-left: 32px;
  align-items: flex-start;
  justify-items: flex-start;
  flex: 1;
  overflow-y: auto;
`

const Actions = styled('div')`
  display: flex;
  flex: 1;
  width: 100%;
  align-items: flex-end;
  flex-direction: column;
  margin-top: 32px;
`
const Row = styled('div')`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  height: 50px;
  padding: 8px;
  overflow: hidden;
  box-sizing: border-box;
`

const Checkmark = styled('img')`
  opacity: 0.5;
  margin-left: 32px;
`

const LoadingWrapper = styled('div')`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
`

const Button = styled('button')`
  font-family: 'Roboto medium', sans-serif;
  font-size: 14px;
  display: inline-block;
  height: 36px;
  min-width: 88px;
  padding: 6px 16px;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border: 0;
  border-radius: 2px;
  background: rgba(103, 58, 183, 1);
  color: #fff;
  outline: 0;
  &:disabled {
    background: rgb(189, 189, 189);
    cursor: default;
  }
`

class Upload extends Component {
  constructor(props) {
    super(props)
    this.ipfsapi = ipfsClient({
      // the hostname (or ip address) of the endpoint providing the ipfs api
      host: props.host,
      // the port to connect on
      port: props.port,
      'api-path': props.apiPath,
      // the protocol, https for security
      protocol: props.protocol,
      headers: props.headers
      // provide the jwt within an authorization header
    })
    this.state = {
      files: [],
      uploading: false,
      loading: {},
      successfullUploaded: false,
      new_hash: null
    }

    this.onFilesAdded = this.onFilesAdded.bind(this)
    this.uploadFiles = this.uploadFiles.bind(this)
    this.sendRequest = this.sendRequest.bind(this)
    this.renderActions = this.renderActions.bind(this)
  }

  onFilesAdded(files) {
    this.setState(prevState => ({
      files: prevState.files.concat(files)
    }))
  }

  renderProgress(file) {
    const loading = this.state.loading[file.name]
    if (this.state.uploading || this.state.successfullUploaded) {
      return (
        <LoadingWrapper>
          <Loading loaded={uploadLoading ? loading.percentage : 0} />
          <Checkmark
            alt="done"
            src="baseline-check_circle_outline-24px.svg"
            style={{
              opacity: loading && loading.state === 'done' ? 0.5 : 0
            }}
          />
        </LoadingWrapper>
      )
    }
  }

  renderActions() {
    if (this.state.successfullUploaded) {
      return (
        <Button
          onClick={() =>
            this.setState({ files: [], successfullUploaded: false })
          }
        >
          Clear
        </Button>
      )
    } else {
      return (
        <Button
          disabled={this.state.files.length < 0 || this.state.uploading}
          onClick={this.uploadFiles}
        >
          Upload
        </Button>
      )
    }
  }

  async uploadFiles() {
    this.setState({ loading: {}, uploading: true })
    const promises = []
    this.state.files.forEach(file => {
      promises.push(this.sendRequest(file))
    })
    try {
      await Promise.all(promises)

      this.setState({ successfullUploaded: true, uploading: false })
    } catch (e) {
      // @TODO Better error handling
      this.setState({ successfullUploaded: true, uploading: false })
    }
  }

  sendRequest(files) {
    return new Promise((resolve, reject) => {
      const file = [...files][0]
      let ipfsId

      const fileDetails = {
        path: file.name,
        content: file
      }

      const options = {
        wrapWithDirectory: true,
        progress: prog => {
          // console.log(`received: ${prog}`)
          const copy = { ...this.state.loading }
          if (prog.lengthComputable) {
            copy[file.name] = {
              state: 'pending',
              percentage: (event.loaded / event.total) * 100
            }
            this.setState({ loading: copy })
          } else if (prog.load) {
            copy[file.name] = { state: 'done', percentage: 100 }
            this.setState({ loading: copy })
          } else {
            copy[file.name] = { state: 'error', percentage: 0 }
            this.setState({ loading: copy })
          }
        }
      }

      this.ipfs
        .add(fileDetails, options)
        .then(response => {
          console.log(response)
          ipfsId = response[response.length - 1].hash
          console.log(ipfsId)
          this.setState({ new_hash: ipfsId })
          resolve(response)
        })
        .catch(err => {
          console.error(err)
          reject(response)
        })
    })
  }

  render() {
    return (
      <Container>
        <Name>Upload Files</Name>
        <Content>
          <Dropzone
            onFilesAdded={this.onFilesAdded}
            disabled={this.state.uploading || this.state.successfullUploaded}
          />
          <Files>
            {this.state.files.map(file => {
              return (
                <Row key={file.name}>
                  <FileName>{file.name}</FileName>
                  {this.renderProgress(file)}
                </Row>
              )
            })}
          </Files>
        </Content>
        <Actions>{this.renderActions()}</Actions>
      </Container>
    )
  }
}

export default Upload
