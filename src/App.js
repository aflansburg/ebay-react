import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import gear from './gear.svg';
import './App.css';
import * as dh from './data-helper';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <p className="App-h2">eBayAPI-React</p>
        </div>
        <p className="App-intro">
          This app is built on Facebook's React + Node.js (v8.5.0) and returns useful information from the eBay API.
        </p>
      </div>
    );
  }
}

const initialState = {
  keywords: '',
  selectedOption: 'New'
}

class NameForm extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleInputChange(event){
    this.setState({keywords: event.target.value});
  }
  handleRadioChange(event){
    this.setState({selectedOption: event.target.value});
  }
  handleSubmit(event){
    ReactDOM.render(
        <div className="loading-msg">
          <img src={gear} className="loading-img" alt="loading-img" />
          <p>Loading.... this may take a while depending on the search parameters, please wait.....</p>
        </div>
        , document.getElementById('results-display'));
    ReactDOM.render(
        <div className="cancel-btn">
          <button className="w3-button w3-red" onClick={
            ()=>{
              ReactDOM.render(
                  <div className="loading-msg">
                    <img src={gear} className="loading-img" alt="loading-img" />
                    <p>Cancelling, please wait. If search was taking too long, try more keywords!</p>
                  </div>
                  , document.getElementById('results-display')
              );
              this.setState = initialState;
              window.location.reload();
            }
          }>Cancel
          </button>
    </div>, document.getElementById('search-form'));
    
    let keywords = this.state.keywords;
    let condition = this.state.selectedOption;
    
    let items = dh.thisDataHelper.getResults(keywords, 30, condition);
    items
        .then(response => {
          const analysis = dh.thisDataHelper.returnAnalysis(response);
          const resultsContent =
              <div className="w3-card-4">
      
                <header className="w3-container w3-blue">
                  <h1>Results for "{analysis.keywords}"</h1>
                </header>
      
                <div className="w3-container">
                  <p>Total Listings: {analysis.allItemsCount}</p>
                  <p>Total # of Sales: {analysis.qtySold}</p>
                  <p>Average Price: ${analysis.averagePrice.toFixed(2)}</p>
                  <p>Percent Sold: {analysis.percentSold}</p>
                  <p>Total $ Sold: ${analysis.totalSold.toFixed(2)}</p>
                  <p>Date Range: {analysis.dateRange}</p>
                </div>
              
            </div>;
          ReactDOM.render(resultsContent, document.getElementById('results-display'));
          ReactDOM.render(
              <div className="cancel-btn">
                <button className="w3-button w3-green"
                        onClick={()=>{
                          this.setState(initialState);
                          window.location.reload();
                        }}>
                  New Search
                </button>
              </div>
          , document.getElementById('search-form'));
        })
        .catch(err => {
          console.log(`Error: ${err}`);
        });
    event.preventDefault();
  }
  
  render(){
    return (
        <form id="searchForm" onSubmit={this.handleSubmit}>
          <label className="searchLabel">
            Search Keywords:
          </label>
          <input className="w3-input w3-border" type="text" value={this.state.keywords} onChange={this.handleInputChange} />
          <div className="radio-pane">
            <input className="w3-radio" type="radio" name="condition" value="New"
                   checked={this.state.selectedOption ==='New'} onChange={this.handleRadioChange} />
            <label>New</label>
            <input className="w3-radio" type="radio" name="condition" value="Used"
                   checked={this.state.selectedOption ==='Used'} onChange={this.handleRadioChange} />
            <label>Used</label>
          </div>
          <input className="w3-button w3-green" type="submit" value="Submit" />
          
        </form>
    );
  }
}

export {App, NameForm};
