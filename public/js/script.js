document.addEventListener(
  'DOMContentLoaded',
  () => {
    console.log('Project2 JS imported successfully!')
  },
  false
)

document.querySelectorAll('.delete').forEach((element) => {
  element.addEventListener('click', (ev) => {
    const confirm = window.confirm('Are you sure?')
    if (!confirm) {
      ev.preventDefault()
    }
  })
})
