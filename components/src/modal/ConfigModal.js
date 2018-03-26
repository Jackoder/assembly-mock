import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  // Popover,
  // Tooltip,
  Button,
  Modal,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';
import Store from '../Store';

export default class ConfigModal extends Component {

  static propTypes = {
    onConfirm: PropTypes.func
  }

  constructor(props, context) {
    super(props, context);
    this.store = new Store();
    this.state = {
      config: null
    };
  }

  handleClose = () => {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true }, () => {
      this.store.getConfigPath()
        .then(config => this.setState({ config }))
    });
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      config: Object.assign({}, this.state.config, { [name]: value })
    });
  }

  onSubmit = () => {
    const { config } = this.state;
    this.store.updateConfigPath(config)
      .then(() => {
        this.props.onConfirm && this.props.onConfirm(config);
        this.handleClose()
      })
      .catch(err => {
        //TODO
      });
  }

  render = () => {
    const { config } = this.state;
    if (!config) {
      return null;
    }

    // const popover = (
    //   <Popover id="modal-popover" title="popover">
    //     very popover. such engagement
    //   </Popover>
    // );
    // const tooltip = <Tooltip id="modal-tooltip">wow.</Tooltip>;

    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <form onSubmit={this.onSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>数据源地址配置</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              Object.keys(config).map((key, index) => (
                <FieldGroup
                  id={key}
                  type="text"
                  name={key}
                  label={key}
                  defaultValue={config[key]}
                  onChange={this.handleInputChange}
                />
              ))
            }
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.onSubmit}>修改</Button>
            <Button onClick={this.handleClose}>关闭</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}


function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}