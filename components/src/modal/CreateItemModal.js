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
  HelpBlock,
  Radio,
  Nav,
  NavItem
} from 'react-bootstrap';
import ReactJson from 'react-json-view';
import JSONInput from 'react-json-editor-ajrm';
import Store from '../Store';

const MODE_KV = 'kv';
const MODE_JSON = 'json';

export default class CreateItemModal extends Component {

  static COMMIT_UPDATE = 'update';
  static COMMIT_ADD = 'post';

  static propTypes = {
    moduleName: PropTypes.string,
    viewmodel: PropTypes.object,
    isEditMode: PropTypes.bool,
    onResultCallback: PropTypes.func,
  }

  constructor(props, context) {
    super(props, context);
    this.store = new Store();
    this.state = {
      formData: null,
      show: false,
      moduleName: null,
      viewmodel: null,
      data: null,
      commitMode: CreateItemModal.COMMIT_ADD,
      editMode: MODE_JSON
    };
  }

  handleClose = () => {
    this.setState({ show: false });
  }

  handleShow = (moduleName, viewmodel, dataClone, commitMode = CreateItemModal.COMMIT_ADD) => {
    let data = dataClone || viewmodel;
    this.setState({ show: true, moduleName, viewmodel, data, commitMode, formData: data });
  }

  onEditModeChanged = editMode => this.setState({ editMode });

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    if (name === 'editMode') {
      this.setState({ editMode: value });
      return;
    }
    this.setState({
      formData: Object.assign({}, this.state.formData, { [name] : value })
    });
  }

  onSubmit = () => {
    const {moduleName, formData, commitMode} = this.state;
    let data = Object.assign({}, formData);
    let result = null;
    if (commitMode === CreateItemModal.COMMIT_ADD) {
      if (data.hasOwnProperty('id')) {
        delete data.id;
      }
      result = this.store.createItem(moduleName, data);
    } else {
      result = this.store.updateItem(moduleName, data);
    }
    result
      .then(() => {
        this.props.onResultCallback && this.props.onResultCallback(commitMode);
        this.handleClose()
      })
      .catch(err => {
        //TODO
      });
  }

  render = () => {
    const {moduleName, viewmodel, data, commitMode} = this.state;
    // if (!viewmodel) {
    //   return null;
    // }

    // const popover = (
    //   <Popover id="modal-popover" title="popover">
    //     very popover. such engagement
    //   </Popover>
    // );
    // const tooltip = <Tooltip id="modal-tooltip">wow.</Tooltip>;

    let editor = null;
    if (viewmodel && this.state.editMode === MODE_KV) {
      editor = Object.keys(viewmodel).map((key, index) => (
        <FieldGroup
          id={key}
          type="text"
          name={key}
          label={viewmodel[key]}
          defaultValue={data[key]}
          onChange={this.handleInputChange}
        />
      ));
    // } else if (this.state.editMode === MODE_JSON) {
    //   editor = <ReactJson
    //     style={{ flex: 1}}
    //     src={this.state.formData}
    //     onEdit={params => {
    //       this.setState({ formData: params.updated_src })
    //     }}
    //   />;
    } else {
      editor = <JSONInput
        id={'jsonInput'}
        style={{outerBox: {flex: 1}}}
        width='570px'
        height='550px'
        viewOnly={false}
        confirmGood={true}
        onChange={params => {
          this.setState({ formData: params.jsObject })
        }}
        placeholder={this.state.formData}
      />;
    }

    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <form onSubmit={this.onSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{commitMode === CreateItemModal.COMMIT_ADD ? '创建' : '修改'}测试数据</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Nav bsStyle="tabs" style={{marginBottom: 10}} activeKey={this.state.editMode} onSelect={this.onEditModeChanged}>
              {
                viewmodel ? (
                  <NavItem eventKey={MODE_KV}>
                    Key-Value
                  </NavItem>
                ) : null
              }
              {/* <NavItem eventKey={MODE_JSON}>
                JSON
              </NavItem> */}
              <NavItem eventKey={MODE_JSON}>
                JSON
              </NavItem>
            </Nav>
            { editor }
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.onSubmit}>提交</Button>
            <Button onClick={this.handleClose}>关闭</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

  createRadio = (name, value, isChecked) => {
    if (isChecked) {
      return <Radio name inline onChange={this.handleInputChange}>{value}</Radio>
    } else {
      return <Radio name inline onChange={this.handleInputChange}>{value}</Radio>
    }
  };
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