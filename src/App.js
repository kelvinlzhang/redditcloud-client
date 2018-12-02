import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import sketch from './sketch';
import ChartContainer from './ChartContainer';
import P5Wrapper from './P5Wrapper';

import './App.css';
import "react-datepicker/dist/react-datepicker.css";

const axios = require('axios');

class App extends Component {
  /**
   * Creates an instance of redditcloud application by initializing the state.
   * All elements of the state are empty, except the word cloud initially has a title
   * consisting of the application name, class, and creators of the application.
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      subreddit: "",
      startDate: new Date(),
      endDate: new Date(),
      word: "",
      frequencies: {
        "RedditCloud": 25,
        "CS130": 15,
        "Kelvin Zhang": 5,
        "Karen Zhang": 5,
        "Vishaal Agartha": 5,
        "CJ Ordog": 5,
        "Anav Sanghvi": 5,
        "Albert Pan": 5
      },
      sentiments: {}
    };

    this.onChangeSubreddit = this.onChangeSubreddit.bind(this);
    this.onChangeStartDate = this.onChangeStartDate.bind(this);
    this.onChangeEndDate = this.onChangeEndDate.bind(this);
    this.onChangeSentimentChart = this.onChangeSentimentChart.bind(this);
  }

  /**
   * Changes state to new subreddit
   * @param {Event} e - Contains the event with new subreddit name
   */
  onChangeSubreddit = (e) => {
    this.setState({ subreddit: e.target.value });
  }

  /**
   * Changes state to new start date
   * @param {Date} date - Contains the date with new start date
   */
  onChangeStartDate = (date) => {
    this.setState({ startDate: date });
  }

  /**
   * Changes state to new end date
   * @param {Date} date - Contains the date with new end date
   */
  onChangeEndDate = (date) => {
    this.setState({ endDate: date });
  }

  /**
   * Changes state to new word to be passed down to SentimentChart
   * @param {Event} e - Contains the event with new word to analyze
   */
  onChangeSentimentChart = (e) => {
    this.setState({ word: e.target.value });
  }

  /**
   * Handles submission of form. Formats data and triggers an HTTP request
   * to backend to obtain data for a certain word. Extracts sentiments and frequencies
   * and assigns it to the state
   * @param {Event} - Contains the on click event
   */
  onSubmit = (e) => {
    e.preventDefault();

    // Data consists of a subreddit of type String, start and end dates of type Integer
    // (in Unix Timestamp format)
    let data = JSON.stringify({
      subreddit: this.state.subreddit,
      start: parseInt((this.state.startDate.getTime() / 1000).toFixed(0)),
      end: parseInt((this.state.endDate.getTime() / 1000).toFixed(0))
    })

    axios.post('http://127.0.0.1:8080', data, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
      },
      timeout: 60000
    })
    .then((res) => res.data)
    .then((data) => {
      // Extract data
      var sentiments = Object.assign({}, ...data.map(({word, timestamps, score, vote}) => ({[word]: {timestamps, score, vote}})));
      var frequencies = data.reduce((map, obj) => (map[obj.word] = obj.frequency, map), {});

      this.setState({
        sentiments: sentiments,
        frequencies: frequencies
      });
    });
  }

  /**
   * Main render function.
   * - Contains P5Wrapper for WordCloud
   * - Contains ChartContainer for SentimentChart
   * - Handles form submission consisting of a subreddit name, start, and end dates
   */
  render() {
    return (
      <div className="App">
        <P5Wrapper sketch={sketch} dict={this.state.frequencies}/>
        <form onSubmit={this.onSubmit}>
          <input value={this.state.subreddit} onChange={this.onChangeSubreddit} />
          <DatePicker
            selected={this.state.startDate}
            onChange={this.onChangeStartDate}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={5}
            dateFormat="MM/d/yyyy h:mm aa"
          />
          <DatePicker
            selected={this.state.endDate}
            onChange={this.onChangeEndDate}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={5}
            dateFormat="MM/d/yyyy h:mm aa"
          />
          <button>Submit</button>
        </form>
        <input style={{display:"none"}} id="canvasForm" value="" onChange={this.onChangeSentimentChart}/>
        {typeof(this.state.sentiments[this.state.word]) !== "undefined" &&
          <ChartContainer 
            word={this.state.word} 
            ts={this.state.sentiments[this.state.word].timestamps} 
            vote={this.state.sentiments[this.state.word].vote} 
            s={this.state.sentiments[this.state.word].score}
          />
        }
      </div>
    );
  }
}

export default App;
