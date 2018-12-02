import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import sketch from './sketch';
import p5 from 'p5';
import './App.css';
import "react-datepicker/dist/react-datepicker.css";
import ChartContainer from './ChartContainer';

const axios = require('axios');

class P5Wrapper extends React.Component {
  componentDidMount() {
    const { sketch, ...rest } = this.props;
    this.canvas = new p5(sketch(rest), this.wrapper);
  }

  componentWillReceiveProps(newProps) {
    const { sketch, ...rest } = newProps;
    console.log(newProps)
    if (this.props.dict !== newProps.dict) {
      this.canvas.remove();
      this.canvas = new p5(newProps.sketch(rest), this.wrapper);
    }

    if (typeof this.canvas.onNewProps === "function") {
      this.canvas.onNewProps(newProps);
    }
  }

  componentWillUnmount() {
    this.canvas.remove();
  }

  render() {
    return <div ref={(wrapper) => this.wrapper = wrapper} />;
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subreddit: "",
      startDate: new Date(),
      endDate: new Date(),
      word: "",
      frequencies: {},
      sentiments: {}
    };

    this.onChangeSubreddit = this.onChangeSubreddit.bind(this);
    this.onChangeStartDate = this.onChangeStartDate.bind(this);
    this.onChangeEndDate = this.onChangeEndDate.bind(this);
    this.onChangeSentimentChart = this.onChangeSentimentChart.bind(this);
  }

  onChangeSubreddit = (e) => {
    this.setState({ subreddit: e.target.value });
  }

  onChangeStartDate = (date) => {
    this.setState({ startDate: date });
  }

  onChangeEndDate = (date) => {
    this.setState({ endDate: date });
  }

  onChangeSentimentChart = (e) => {
    console.log(e);
    this.setState({ word: e.target.value });
  }

  onSubmit = (e) => {
    e.preventDefault();

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
      var sentiments = Object.assign({}, ...data.map(({word, timestamps, score, vote}) => ({[word]: {timestamps, score, vote}})));
      var frequencies = data.reduce((map, obj) => (map[obj.word] = obj.frequency, map), {});

      this.setState({
        sentiments: sentiments,
        frequencies: frequencies
      });
    });
  }

  render() {
    return (
      <div className="App">
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
        <P5Wrapper sketch={sketch} dict={this.state.frequencies}/>
        <input id="canvasForm" value="" onChange={this.onChangeSentimentChart}/>
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
