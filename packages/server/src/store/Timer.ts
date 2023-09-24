class Timer {
  public time: number;
  
  constructor(totalTime: number) {
    this.time = totalTime;
  }

  tick() {
    this.time--;
  }
}

export default Timer;