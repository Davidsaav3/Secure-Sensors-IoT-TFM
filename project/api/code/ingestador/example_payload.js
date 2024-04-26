const payload = {
    end_device_ids: {
      device_id: 'ua-sensor-s27',
      application_ids: { application_id: 'ua-sensor' },
      dev_eui: '70B3D57ED005A7B3',
      join_eui: '0000000000000000',
      dev_addr: '260BF563'
    },
    correlation_ids: [ 'gs:uplink:01HG8JYAD7SHW4H5R2M01T8PM8' ],
    received_at: '2023-11-27T14:29:12.949932734Z',
    uplink_message: {
      session_key_id: 'AYwNXCQmhSJ3rXvCkQD1vg==',
      f_port: 1,
      f_cnt: 1707,
      frm_payload: 'cYoZQndkAr/NzNRCAACgQAAAKkNcR8A+AEAVRA==',
      decoded_payload: { bytes: [Array] },
      rx_metadata: [ [Object], [Object], [Object] ],
      settings: {
        data_rate: [Object],
        frequency: '867900000',
        timestamp: 903876163,
        time: '2023-11-27T14:28:02.465946Z'
      },
      received_at: '2023-11-27T14:29:12.744297392Z',
      consumed_airtime: '0.087296s',
      network_ids: {
        net_id: '000013',
        ns_id: 'EC656E0000000181',
        tenant_id: 'ttn',
        cluster_id: 'eu1',
        cluster_address: 'eu1.cloud.thethings.network'
      }
    }
  }

  module.exports = { payload }