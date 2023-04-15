const list = document.getElementById('list');
let base; let randomized; let dragging; let
  draggedOver;
let isRight = 'Not In Order!';

const genRandom = (array) => {
  base = array.slice();
  randomized = array.sort(() => Math.random() - 0.5);
  if (randomized.join('') !== base.join('')) {
    renderItems(randomized);
  } else {
    // recursion to account if the randomization returns the original array
    genRandom();
  }
};

const renderItems = (data) => {
  document.getElementById('isRight').innerText = isRight;
  list.innerText = '';
  data.forEach((item) => {
    const node = document.createElement('li');
    node.draggable = true;
    node.style.backgroundColor = item;
    node.style.backgroundColor = node.style.backgroundColor.length > 0
      ? item : 'lightblue';
    node.addEventListener('drag', setDragging);
    node.addEventListener('dragover', setDraggedOver);
    node.addEventListener('drop', compare);
    node.innerText = item;
    list.appendChild(node);
  });
};

const compare = (e) => {
  const index1 = randomized.indexOf(dragging);
  const index2 = randomized.indexOf(draggedOver);
  randomized.splice(index1, 1);
  randomized.splice(index2, 0, dragging);

  isRight = randomized.join('') === base.join('')
    ? 'In Order!' : 'Not In Order!';

  renderItems(randomized);
};

const setDraggedOver = (e) => {
  e.preventDefault();
  draggedOver = Number.isNaN(parseInt(e.target.innerText, 10)) ? e.target.innerText : parseInt(e.target.innerText, 10);
};

const setDragging = (e) => {
  dragging = Number.isNaN(parseInt(e.target.innerText, 10)) ? e.target.innerText : parseInt(e.target.innerText, 10);
};

// genRandom([0, 1, 2, 3, 4, 5, 6])
genRandom(['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']);
