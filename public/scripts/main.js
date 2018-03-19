$(function(){

  const ls = localStorage
  const log = console.log
  const logErr = console.error
  let state = new Map
  const setState = (key, val, verbose = false) => {
    ls.setItem(key, val)
    state.set(key, val)
    if (verbose) log('State changed!', `${key} has new value. Current State:\n`, state)
  }

  // Function to fetch URL parameters
  const urlParam = (name, url = window.location.href) => {
    let results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url)
    return results ? decodeURIComponent(results[1]) : 0
  }

  // State Initialization
  state.set('status', 'disconnected')
  state.set('authorization_code', ls.getItem('authorization_code') || '')
  state.set('refresh_token', ls.getItem('refresh_token') || '')
  state.set('access_token', ls.getItem('access_token') || '')
  //TODO: Get new access_token

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
    log('SafeTrek is connected! Current State:', state)
    $('a.safetrek-btn > img').attr('src', '/assets/images/safetrek-disconnect-button.png')
    $('input#authorization_code').val(state.get('authorization_code'))
    $('input#access_token').val(state.get('access_token'))
    $('input#refresh_token').val(state.get('refresh_token'))
  } else {
    log('SafeTrek is not connected! Current State:\n', state)
  }

  $('input.display-only').on('blur', function() {
    $(this).val(state.get($(this).attr('id')))
  })

  $('a.safetrek-btn').on('click', function(e){
    if(state.get('status') !== 'disconnected') {
      e.preventDefault()
      ls.clear()
      location.href = location.origin + location.pathname
    }
  })

  $('.new-token').on('click', function() {
    let that = $(this)
    that.prop('disabled', true)
    let url = `/?refresh_token=${state.get('refresh_token')}`
    $.ajax({
      url: url,
      dataType: 'json',
      success: (data) => {
        setState('access_token', data.access_token, true)
        $('input#access_token').val(data.access_token)
      },
      error: (xhr, status, err) => { logErr('Error:', err) },
      complete: () => { that.prop('disabled', false) }
    })
  })

  $('a.make-alarm-request').on('click', function(e) {
    e.preventDefault()
    if(state.get('status') !== 'processing') {
      state.set('status', 'processing')
      let url = 'https://api-sandbox.safetrek.io/v1/alarms'
      let data = $('code.alarm-request').text()
      log('Requesting Alarm creation with data:\n', data)
      $.ajax({
        url: url,
        type: 'post',
        headers: {
          'Authorization': `Bearer ${state.get('access_token')}`
        },
        contentType: 'application/json',
        dataType: 'json',
        data: data,
        success: (data) => {
          log('Alarm created successfully! Server response:\n', JSON.stringify(data, null, 2))
        },
        error: (xhr, status, err) => { logErr('Error:', err) },
        complete: () => { state.set('status', 'connected') }
      })
    }
  })

  $('a.use-geo').on('click', function(e) {
    e.preventDefault()
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {log(pos)},
        (posErr) => {logErr(posErr)}
      )
    } else {
      log('Geolocation is not available on this browser.')
    }
  })

})