$(function(){

  const ls = localStorage
  const log = console.log
  let state = new Map
  const setState = (key, val) => {
    ls.setItem(key, val)
    state.set(key, val)
  }

  // Function to fetch URL parameters
  const urlParam = (name) => {
    let results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href)
    return results ? decodeURIComponent(results[1]) : 0
  }

  // State Initialization
  state.set('status', 'disconnected')
  state.set('authorization_code', ls.getItem('authorization_code') || '')
  state.set('access_token', ls.getItem('access_token') || '')
  state.set('refresh_token', ls.getItem('refresh_token') || '')

  // Materialize Components Initialization
  $('.button-collapse').sideNav()

  // Update state based on query params
  if(urlParam('authorization_code') && urlParam('access_token') && urlParam('refresh_token')) {
    setState('authorization_code', urlParam('authorization_code'))
    setState('access_token', urlParam('access_token'))
    setState('refresh_token', urlParam('refresh_token'))
  }

  if(state.get('authorization_code')) {
    state.set('status', 'connected')
    log('SafeTrek is connected!', state)
    $('a.safetrek-btn > img').attr('src', '/assets/images/safetrek-disconnect-button.png')
    $('input#authorization_code').val(state.get('authorization_code'))
    $('input#access_token').val(state.get('access_token'))
    $('input#refresh_token').val(state.get('refresh_token'))
  }

  $('input.display-only').on('blur', function() {
    $(this).val(state.get($(this).attr('id')))
  })

  $('a.safetrek-btn').on('click', function(e){
    if(state.get('status') === 'connected') {
      e.preventDefault()
      ls.clear()
      location.href = location.origin + location.pathname
    }
  })



})