fetch('/trending')
  .then(response => response.json())
  .then(data => console.log(data))
