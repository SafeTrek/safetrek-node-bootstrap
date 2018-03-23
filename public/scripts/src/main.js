import $ from 'jquery'
import Hammer from 'hammerjs'
import 'materialize-css'

$(function(){

  const CALLBACK_URL =  '/callback'
  const SAFETREK_API_URL =  'https://api-sandbox.safetrek.io/v1'
  const DEFAULT_ACCURACY =  5
  const RANDOM_ADDRESS_DATA = '/address-us-100.min.json'

  const ls = localStorage
  const log = console.log
  const logErr = console.error
  const logWarn = console.warn
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
    logWarn('SafeTrek is not connected! Current State:\n', state)
  }

  // Prevent changing code and token field values
  $('input.display-only').on('blur', function() {
    $(this).val(state.get($(this).attr('id')))
  })

  // Disconnect from SafeTrek. Clear all data and reload page.
  $('a.safetrek-btn').on('click', function(e){
    e.preventDefault()
    let that = $(this)
    if(state.get('status') !== 'disconnected') {
      ls.clear()
      location.href = location.origin + location.pathname
    } else {
      let url = ''
      if(that.attr('data-localhost') === 'true') {
        url = that.attr('data-href')
        url += that.attr('data-protocol')
        url += '://localhost:'
        url += that.attr('data-port')
        url += that.attr('data-callback')
      } else {
        url = that.attr('data-href')
        url += that.attr('data-redirect')
      }
      location.href = url
    }
  })

  // Exchange refresh_token for new access_token
  $('.new-token').on('click', function() {
    let that = $(this)
    that.prop('disabled', true)
    let url = `${CALLBACK_URL}?refresh_token=${state.get('refresh_token')}`
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
    if (state.get('status') === 'active-alarm') {
      log('Alarm status is currently active and will reset in 10s or less.')
    } else if(state.get('status') !== 'processing') {
      if(state.get('access_token')) {
        $('.alarm').removeClass('alarm-red')
        $('.alarm-status').text('Requesting...')
        state.set('status', 'processing')
        let url = SAFETREK_API_URL + '/alarms'
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
            log('Alarm created successfully! Server response:\n', JSON.stringify(data, null, 2), '\nAlarm status will reset in 10s.')
            $('.alarm').addClass('alarm-red')
            $('.alarm-status').text('Alarm created! Check console for JSON response.')
          },
          error: (xhr, status, err) => { logErr('Error:', err) },
          complete: () => {
            state.set('status', 'active-alarm')
            setTimeout(() => {
              state.set('status', 'connected')
              $('.alarm').removeClass('alarm-red')
              $('.alarm-status').text('')
              log('Alarm status reset!')
            }, 10000)
          }
        })
      } else {
        logErr('No valid access_token found! Connect to SafeTrek before requesting Alarm creation.')
      }
    }
  })

  $('.use-addr').on('click', function(e) {
    e.preventDefault()
    let that = $(this)
    $.getJSON(RANDOM_ADDRESS_DATA, (data) => {
      const addresses = data.addresses
      const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]
      let responseJSON = {
        "services": {
          "police": true,
          "fire": false,
          "medical": false
        },
        "location.address": {
          "line1": randomAddress.address1,
          "line2": randomAddress.address2,
          "city": randomAddress.city,
          "state": randomAddress.state,
          "zip": randomAddress.postalCode
        }
      }
      $('code.alarm-request').text(JSON.stringify(responseJSON, null, 2))
      that.addClass('hide')
      $('.use-coords').removeClass('hide')
      log('Using random location address.')
    })
  })

  $('.use-coords').on('click', function(e) {
    e.preventDefault()
    let that = $(this)
    $.getJSON(RANDOM_ADDRESS_DATA, (data) => {
      const addresses = data.addresses
      const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]
      let responseJSON = {
        "services": {
          "police": true,
          "fire": false,
          "medical": false
        },
        "location.coordinates": {
          "lat": randomAddress.coordinates.lat,
          "lng": randomAddress.coordinates.lng,
          "accuracy": DEFAULT_ACCURACY
        }
      }
      $('code.alarm-request').text(JSON.stringify(responseJSON, null, 2))
      that.addClass('hide')
      $('.use-addr').removeClass('hide')
      log('Using random location coordinates.')
    })
  })

})