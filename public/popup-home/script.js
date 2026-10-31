const message = document.querySelector('.message')

document.querySelector('.close').addEventListener('click', () => {
  message.textContent = 'Menu fechado.'
})

document.querySelectorAll('.popup button:not(.close):not(.logout)').forEach((button) => {
  button.addEventListener('click', () => {
    message.textContent = `${button.textContent} selecionado.`
  })
})

document.querySelector('.logout').addEventListener('click', () => {
  window.location.href = '../sobre/'
})
