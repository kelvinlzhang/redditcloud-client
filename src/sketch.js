/*
	TODO:
		1. add inwards force
		2. add color
		3. add ability to click/drag words
		4. clean up/refactor
		5. figure out communication with sentiment charts
*/

const sketch = (props) => (p) => { 
  var colorBaseOptions = [];
  
  var scalar = 0.82; // Different for each font
  var debug = false;
  
  var font,
      fontSize = 80,
      minFontSize = 12;
  
  var spawnBoxSize = 50;

  var maxWords = 40;
    
  var x,y, cloud;
  
  var numColors = 10;
  var colorMinOffset = 10;
  var colorMaxOffset = 65;
  
  var ih;
  
  class wordCloud {
    constructor(wordDict) {
    
      this.wordDict = wordDict;
      this.wordBoxes = [];
      /*
        boundaries are much bigger than necessary to ensure that 
        no words exit the screen by jumping over or through a boundary
  
        (0,0)
      |--------|--------|--------|
      |        |   b3   |        |
      |        |        |        |
      |        |--------|        |
      |   b2   | canvas |   b1   |
      |        |        |        |
      |        |--------|        |
      |        |   b4   |        |
      |        |        |        |
      |--------|--------|--------|
                    (width, height)
      */
      this.boundaries = [
        //b1
        new Rectangle(p.width,  -p.height, p.width, p.height * 3),
        //b2
        new Rectangle(-p.width, -p.height, p.width, p.height * 3),
        //b3
        new Rectangle(0, -p.height, p.width, p.height),
        //b4
        new Rectangle(0, p.height, p.width, p.height)
      ];
  
      var baseColor = colorBaseOptions[Math.floor(Math.random() * colorBaseOptions.length)];
  
      var maxFreq = 0;
      for (const [word, freq] of Object.entries(wordDict)) {
        if (freq > maxFreq) {
          maxFreq = freq;
        }
      }
      var sortable = Object.entries(wordDict);
      sortable.sort(function(a, b) {
        return b[1] - a[1];
      });
      var minFreq;
      if (maxWords > sortable.length) {
        minFreq = 1;
      } else {
        minFreq = sortable[maxWords][1];
      }
      sortable = sortable.slice(0, maxWords);
      var count = 0;
      for (const [word, freq] of sortable) {
        var isBiggest = count == 0 ? true : false;
        count++;
        this.wordBoxes.push(new wordBox(word, freq, maxFreq, minFreq, 
          this.getProceduralColor(baseColor, colorMinOffset, colorMaxOffset), isBiggest));
      }
    }
  
    render() {
      for (var i = 0; i < this.wordBoxes.length; i++) {
        this.wordBoxes[i].render();
      }
      if (debug) {
        for (var i = 0; i < this.boundaries.length; i++) {
          this.boundaries[i].render();
        }
      }
    }
  
    handleCollisions() {
      for (var i = 0; i < this.wordBoxes.length; i++) {
        for (var j = i; j < this.wordBoxes.length; j++) {
          if (i == j) continue;
          this.wordBoxes[i].handleCollision(this.wordBoxes[j]);
        }
      }
      for (var i = 0; i < this.wordBoxes.length; i++) {
        this.wordBoxes[i].move();
      }
    }
  
    handleBoundary() {
      for (var i = 0; i < this.wordBoxes.length; i++) {
        for (var j = 0; j < this.boundaries.length; j++) {
          this.wordBoxes[i].handleBoundary(this.boundaries[j]);
        }
      }
    }
  
    getProceduralColor(colorBase, min, max) {
      return p.color(this.procColorHelper(p.red(colorBase), min, max),
                   this.procColorHelper(p.green(colorBase), min, max),
                   this.procColorHelper(p.blue(colorBase), min, max))
    }
  
    procColorHelper(val, min, max) {
      var temp = val + (Math.random() * ((max*2) - (min*2))) - max;
      temp = Math.floor(temp <= 0 ? temp - min : temp + min);
      return temp;
    }
  }
  
  class wordBox {
    constructor(text, freq, maxFreq, minFreq, color, isBiggest) {
      this.text = text;
      this.isBiggest = isBiggest;
      this.freq = freq;
      this.maxFreq = maxFreq;
      this.minFreq = minFreq;
      this.fontSize = p.map((freq - minFreq)/(maxFreq - minFreq), 0, 1, minFontSize, fontSize);
      p.textSize(this.fontSize);
      var randX = Math.random() * spawnBoxSize - spawnBoxSize / 2;
      var randY = Math.random() * spawnBoxSize - spawnBoxSize / 2;
      this.rect = new Rectangle(p.width / 2 - p.textWidth(text) / 2 + randX, 
                    p.height / 2 + randY, 
                    p.textWidth(text), 
                    this.fontSize * scalar,
                    isBiggest);
      this.yOffset = this.fontSize * (1 - scalar);
      this.color = color;
    }
  
    render() {
      p.textSize(this.fontSize);
      p.fill(this.color);
      p.text(this.text, this.rect.x, this.rect.y - this.yOffset);
      if (debug) {
        this.rect.render();
      }
    }
    
    handleCollision(other) {
      this.rect.handleCollision(other.rect);
    }
  
    move() {
      this.rect.move();
    }
  
    handleBoundary(bound) {
      this.rect.handleCollision(bound);
    }
  }
  
  class Rectangle {
    constructor(x,y,w,h,isBiggest) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.midX = x + w / 2;
      this.midY = y + h / 2;
      this.vx = 0;
      this.vy = 0;
      this.isBiggest = isBiggest
    }
  
    area() {
      return this.w * this.h;
    }
  
    render() {
      p.rect(this.x, this.y, this.w, this.h);
    }
  
    handleCollision(other) {
      if (!this.collides(other)) {
        return
      }

      var spring = 0.5;
      var force = 800000;
      var sizeScale = 0.3;
      var biggestScale = this.isBiggest == true ? 1/50000 : 1;

      var dx = this.midX - other.midX,
          dy = this.midY - other.midY;
      var threshold = 1.0;
      if (dx < threshold && dx >= 0) {
        dx = threshold;
      } else if (dx > -threshold && dx <= 0) {
        dx = -threshold;
      }
      if (dy < threshold && dy >= 0) {
        dy = threshold;
      } else if (dy > -threshold && dy <= 0) {
        dy = -threshold;
      }
  
      // var constvx = force * spring * dx / distance / distance,
      // 	constvy = force * spring * dy / distance / distance;
      var constvx = force * spring / dx, // Math.abs(dx),
        constvy = force * spring / dy; // Math.abs(dy);
  
      var areaScale1 = p.pow(this.area(), sizeScale);
      var areaScale2 = p.pow(other.area(), sizeScale);
  
      var max = 1;
      this.vx += clampAbs(constvx / areaScale1 * biggestScale, max);
      this.vy += clampAbs(constvy / areaScale1 * biggestScale, max);
      other.vx -= clampAbs(constvx / areaScale2, max);
      other.vy -= clampAbs(constvy / areaScale2, max);
    }
  
    addInwardsForce() {
      var forceStrength = 0.0001;
      var centerX = p.width / 2;
      var centerY = p.height / 2;
      var fX = centerX - this.midX;
      var fY = centerY - this.midY;
      this.vx += fX * forceStrength;
      this.vy += fY * forceStrength;
    }
  
    move() {
      // this.addInwardsForce();
      var drag = 0.4;
      this.x += this.vx;
      this.y += this.vy;
      this.midX = this.x + this.w / 2;
      this.midY = this.y + this.h / 2;
      this.vx = this.vx * drag;
      this.vy = this.vx * drag;
    }
  
    collides(other) {
      if (this.x < other.x + other.w && this.x + this.w > other.x &&
            this.y < other.y + other.h && this.y + this.h > other.y) {
        return true;
      }
      return false;
    }
  
    contains(x, y) {
      if (x > this.x && x < this.x + this.w &&
          y > this.y && y < this.y + this.h) {
        return true;
      }
      return false;
    }
  }
  
  class InputHandler {
    constructor(wordBoxes) {
      this.wordBoxes = wordBoxes;
      this.attachedBox = null;
      this.xOffset = 0;
      this.yOffset = 0;
      this.clickX = 0;
      this.clickY = 0;
      this.isPressed = false;
      this.clickThreshold = 2;
    }
  
    mousePressed() {
      for (var i = 0; i < this.wordBoxes.length; i++) {
        if (this.wordBoxes[i].rect.contains(p.mouseX, p.mouseY)) {
          this.attachedBox = this.wordBoxes[i];
          this.xOffset = p.mouseX - this.wordBoxes[i].rect.x;
          this.yOffset = p.mouseY - this.wordBoxes[i].rect.y;
        }
      }
      this.isPressed = true;
      this.clickX = p.mouseX;
      this.clickY = p.mouseY;
    }
  
    mouseReleased() {
      if (this.clickX - p.mouseX < this.clickThreshold && this.clickX - p.mouseX > -this.clickThreshold &&
          this.clickY - p.mouseY < this.clickThreshold && this.clickY - p.mouseY > -this.clickThreshold) {
        this.mouseClicked();
      }
      this.attachedBox = null;
      this.isPressed = false;
    }
  
    mouseClicked() {
      if (this.attachedBox != null) {
        console.log(this.attachedBox.text);
        this.updateSentimentChart();
      }
    }
  
    handleAttachedBox() {
      if (this.attachedBox == null) {
        return;
      }
      this.attachedBox.rect.x = p.mouseX - this.xOffset;
      this.attachedBox.rect.y = p.mouseY - this.yOffset;
    }
  
    updateSentimentChart() {
      var val;
      if (this.attachedBox == null) {
        val = "";
      } else {
        val = this.attachedBox.text;
      }

      var input = document.getElementById("canvasForm");
      var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(input, val);
      var ev = new Event('input', { bubbles: true});
      console.log(ev);
      input.dispatchEvent(ev);
    }
  }
  
  p.setup = () => {
    p.createCanvas(720, 400);
    p.textSize(fontSize);
    p.textAlign(p.LEFT, p.TOP);
    p.textLeading(0);
    colorBaseOptions = [
      p.color(0, 51, 204),
      p.color(51, 204, 51),
      p.color(255, 153, 51),
      p.color(153, 51, 255),
      p.color(51, 204, 204)
    ];
    cloud = new wordCloud(props.dict);
    //make sure to initialize inputHandler after wordCloud, should refactor this
    ih = new InputHandler(cloud.wordBoxes);
  }
  
  
  p.draw = () => {
    if (debug) {
      p.noFill();
      p.stroke(255, 128, 0);
    } else {
  
    }
    p.background(255);
  
    cloud.handleBoundary();
    cloud.handleCollisions();
    ih.handleAttachedBox();
    cloud.render();
  }
  
  // p.windowResized = () => {
  //   var width = document.getElementById('canvasContainer').offsetWidth;
  //   var height = document.getElementById('canvasContainer').offsetHeight;
  //   p.resizeCanvas(width, height);
  // }
  
  function clampAbs(val, max) {
    var sign = (val < 0) ? -1 : 1;
    var temp = (val < 0) ? -val : val;
    if (temp > max) {
      return sign * max;
    } else {
      return val;
    }
  }
  
  p.mousePressed = () => {
    ih.mousePressed();
  }
  
  p.mouseReleased = () => {
    ih.mouseReleased();
  }
}

export default sketch;