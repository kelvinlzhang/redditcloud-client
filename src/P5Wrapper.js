import React, { Component } from 'react';
import p5 from 'p5';

class P5Wrapper extends Component {
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

export default P5Wrapper;