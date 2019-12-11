import React from 'react'
import styled from '@emotion/styled'
import Upload from './Upload'

const UploadContainer = styled('div')`
  position: relative;
`

class UploadModal extends React.Component {
  state = {
    showModal: false
  }
  toggleModal = () => this.setState(state => ({ showModal: !state.showModal }))
  render = () => {
    const { className } = this.props
    const { showModal } = this.state

    return (
      <UploadContainer className={className}>
        <Upload active={showModal} onClick={this.toggleModal} />
      </UploadContainer>
    )
  }
}

export default UploadModal
