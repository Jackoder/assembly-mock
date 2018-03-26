import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  // Popover,
  // Tooltip,
  Button,
  Modal,
  // FormGroup,
  // FormControl,
  // ControlLabel,
  // HelpBlock
} from 'react-bootstrap';

export default class DeleteItemModal extends Component {

  static propTypes = {
    onConfirm: PropTypes.func,
  }

  state = {
    visible: false,
    moduleName: null,
    item: null
  }
  
  handleClose = () => {
    this.setState({ visible: false });
  }

  handleShow = (moduleName, item) => {
    this.setState({ visible: true, moduleName, item });
  }

  render = () => (
    <Modal show={this.state.visible} onHide={this.handleClose}>
      <Modal.Header>
        <Modal.Title>确认删除</Modal.Title>
      </Modal.Header>

      {/* <Modal.Body>One fine body...</Modal.Body> */}

      <Modal.Footer>
        <Button onClick={this.handleClose}>关闭</Button>
        <Button bsStyle="danger" onClick={e => {
          this.props.onConfirm && this.props.onConfirm(this.state.moduleName, this.state.item);
          this.handleClose();
        }}>删除</Button>
      </Modal.Footer>
    </Modal>
  );
}