document.querySelectorAll('[data-go]').forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = button.dataset.go
  })
})
