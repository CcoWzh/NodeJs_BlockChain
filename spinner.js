module.exports = (function() {
  let index = 0;

  function getRandomSpinner() {
    return Object.keys(spinners)[Math.floor(Math.random()*Object.keys(spinners).length)]
  }

});
