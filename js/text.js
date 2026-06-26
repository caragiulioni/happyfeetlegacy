class Text {
  constructor(root) {
    const div = document.createElement('div');
    const hiScore = document.createElement("div");

    div.classList.add("scores");
    div.id = "score";

    hiScore.classList.add("scores");
    hiScore.id = "hi-score";
    hiScore.innerText = "HIGHSCORE: 0";

    root.appendChild(hiScore);
    root.appendChild(div);
    div.innerText = "SCORE: 0";
    this.domElement = div;
    this.hiScore = hiScore;

    const scoreDivs = document.getElementsByClassName("scores");
    for (let i = 0; i < scoreDivs.length; i++) {
      const element = scoreDivs[i];
      element.style.fontSize = `${Math.floor(12 * SCALE * FONT_SCALE)}px`;
      element.style.fontWeight = IS_MOBILE ? "600" : "700";
      element.style.backgroundColor = "#568FB0";
      element.style.position = 'absolute';
      element.style.left = `${Math.floor(5 * SCALE)}px`;
      element.style.color = 'white';
      element.style.borderRadius = "5px";
      element.style.border = "2px solid white";
      element.style.padding = `${Math.floor(4 * SCALE * FONT_SCALE)}px`;
      element.style.zIndex = 3000;
    }

    // Position: highscore top, score below it (below title banner)
    hiScore.style.top = `${Math.floor(70 * SCALE)}px`;
    div.style.top = `${Math.floor(95 * SCALE)}px`;
  }

  update(txt) {
    this.domElement.innerText = `SCORE: ${txt}`;
  }

  highScore(txt) {
    this.hiScore.innerText = `HIGHSCORE: ${txt}`;
  }
}
