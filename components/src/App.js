import React, { Component } from 'react';
import { Tabs, Tab, Table, Button, ButtonGroup } from 'react-bootstrap';
import ReactJson from 'react-json-view';
import Store from './Store';
import {CreateItemModal, DeleteItemModal, ConfigModal} from './modal';
import logo from './logo.svg';
import './App.css';
import _ from 'lodash';

export default class App extends Component {

  state = {
    db: null,
    selectedModule: null,
    modules: null,
    viewmodels: null
  };

  constructor(props) {
    super(props);
    this.store = new Store();
    this.createModal = null;
    this.deleteModal = null;
  }

  componentDidMount() {
    this.fetchConfig();
    this.fetchDb();
  }

  fetchConfig = () => {
    this.store.getConfigPath()
      .then(config => {
        Promise.all([this.store.proxy(config.modules), this.store.proxy(config.viewmodels)])
          .then(values => {
            this.setState({modules: values[0], viewmodels: values[1]});
          })
      })
      .catch(err => {
        //TODO
      });
  }

  fetchDb = () => {
    this.store.getDb()
      .then(db => this.setState({ db }))
      .catch(err => {
        //TODO
      });
  }

  _deleteItem = (moduleName, data) => {
    this.store.deleteItem(moduleName, data)
      .then(result => {
        console.log('delete ' + moduleName, result);
        this.fetchDb()
      })
  }

  _updateConfig = () => {
    this.fetchConfig();
  }

  render = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <header style={{ flex: 1, textAlign: 'center', backgroundColor: '#222', height: 150, padding: 20, color: 'white' }}>
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Mock Data</h1>
          <span style={{position: 'absolute', right: 10, top: 10, cursor: 'pointer'}} onClick={() => this.configModal.handleShow()}>数据源地址</span>
        </header>
        {
          this._renderContent()
        }
        <CreateItemModal
          ref={ref => this.createModal = ref}
          store={this.store}
          viewmodel={this.state.viewmodels ? this.state.viewmodels['carousel_item'] : null}
          onResultCallback={action => this.fetchDb()}
        />
        <DeleteItemModal
          ref={ref => this.deleteModal = ref}
          onConfirm={this._deleteItem}
        />
        <ConfigModal
          ref={ref => this.configModal = ref}
          onConfirm={this._updateConfig} 
        />
      </div>
    );
  }

  _renderContent = () => {
    if (this.state.modules) {
      const modules = this.state.modules;
      let tabs = Object.keys(modules);
      return (
        <Tabs id='tabs' style={{ padding: 10 }}>
          {
            tabs.map((tab, index) => this._renderItems(tab, modules[tab], index))
          }
        </Tabs>
      );
    }
    return null;
  }

  _renderItems = (name, module, index) => {
    let children = null;
    if (module.dataType === 'list') {
      children = this._renderSubModelList(name, module.subModelList);
    } else {
      //TODO
      let viewmodel = this.state.viewmodels[_.get(module, 'subModelList[0].key')];
      children = [
        <ReactJson
          style={{ flex: 1, marginTop: 10, marginBottom: 10 }}
          src={this.state.db[name]}
          name={'模块内容'}
          enableClipboard={false}
          displayDataTypes={false}
        />,
        <Button key='new' bsStyle="primary" onClick={e => this.createModal.handleShow(name, viewmodel, this.state.db[name])}>修改</Button>
      ];
    }
    return (
      <Tab key={index} eventKey={name} title={name}>
        <ReactJson
          style={{ flex: 1, marginTop: 10, marginBottom: 10 }}
          src={module}
          name={'模块配置'}
          enableClipboard={false}
          displayDataTypes={false}
          collapsed={true}
        />
        {children}
      </Tab>
    );
  }

  _renderSubModelList = (moduleName, subModelList) => {
    if (subModelList.length > 1) {
      return (
        <Tabs id={moduleName + '_subModels'}>
          {
            subModelList.map((subModel, index) => (
              <Tab key={'submodel_' + index} eventKey={index} title={subModel.describe || subModel.key}>
                {
                  this._renderDbTable(moduleName, subModel)
                }
              </Tab>
            ))
          }
        </Tabs>
      );
    } else {
      return this._renderDbTable(moduleName, subModelList[0])
    }
  }

  _renderDbTable = (moduleName, subModel) => {
    if (!this.state.db || !this.state.viewmodels) {
      return null;
    }

    let viewmodel = this.state.viewmodels[subModel.key];
    if (!viewmodel) {
      console.log('viewmodel not found for subModel.key ' + subModel.key);
      return null;
    }
    let items = this.state.db[moduleName];

    const columnKeys = Object.keys(viewmodel);
    const table = (
      <Table key='table' striped bordered condensed hover>
        <thead>
          <tr>
            {
              columnKeys.map((key, index) => <th key={index}>{viewmodel[key]}</th>)
            }
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {
            items ? items.map((item, index) => (
              <tr key={index}>
                {
                  columnKeys.map((key, index) => <td key={index} style={{ 'verticalAlign': 'middle', overflow: 'hidden', whiteSpace: 'nowrap' }}>{typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key]}</td>)
                }
                <td style={{ minWidth: 200 }} align='center'>
                  <ButtonGroup>
                    <Button bsStyle="primary" onClick={e => this.createModal.handleShow(moduleName, viewmodel, item, CreateItemModal.COMMIT_UPDATE)}>修改</Button>
                    <Button bsStyle="info" onClick={e => this.createModal.handleShow(moduleName, viewmodel, item)}>复制</Button>
                    <Button bsStyle="danger" onClick={e => this.deleteModal.handleShow(moduleName, item)}>删除</Button>
                  </ButtonGroup>
                </td>
              </tr>
            )) : null
          }
        </tbody>
      </Table>
    );
    return (
      [
        <div style={{overflow: 'scroll'}}>
          {table}
        </div>,
        <Button key='new' bsStyle="primary" style={{marginTop: 10}} onClick={e => this.createModal.handleShow(moduleName, viewmodel)}>新增</Button>
      ]
    );
  }

}
