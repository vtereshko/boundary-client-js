window.onload = function () {

  var meterStatusData = bndry.dataSource.create('meter_status'),
      subscription = null;
  /*
     Processes the state field into a more useful form for drawing a bar graph over a time interval.
     For the volume_1s query, the state key is the timestamp of the sample.
  */
  function getMeters(){
    var orgid = bndry.auth.org_id,
        apikey = bndry.auth.apikey,
        url = 'https://api.boundary.com/' + orgid + '/meters',
        meterArray = new Array();

    var client = new XMLHttpRequest();

    client.open("GET",url,false);
    client.setRequestHeader("Authorization", "Basic " + base64_encode(apikey + ":"));
    client.setRequestHeader("Content-Type","application/json");
    client.send(null);
    var data = JSON.parse(client.responseText);

    var i = 0;
    for (var key in data)
    {
        if (data.hasOwnProperty(key))
        {
                meterArray[i] = new Array();
                meterArray[i][0] = data[key]["export_address"].toString();
                meterArray[i][1] = data[key]["id"].toString();
                meterArray[i][2] = data[key]["name"].toString();
                i++;
        }
    }
    return meterArray;

  }
  function normalizeOctets (data, callback) {
    var meterArray = new Array();
    var i = 0;
    for (var key in data.state)
    {
        if ( data.state.hasOwnProperty(key))
        {
                if ( data.state[key]["connected"])
                {
                        meterArray[i] = new Array();
                        meterArray[i][0] = data.state[key]["exportAddress"];
                        meterArray[i][1] = data.state[key]["meterId"];
                        i++;
                }
        }

    }
    return meterArray;
  }


  function compare(a1, a2)
  {
     var diff = new Array();
     var k = 0;
     for (var i =0; i < a1.length ; i++)
     {
        var p1 = a1[i][0],
            p2 = a1[i][1],
            p3 = a1[i][2],
            found = 0;
        for (var j=0; j < a2.length; j++)
        {
                q1 = a2[j][0];
                q2 = a2[j][1];
                if ((q1==p1) && (q2==p2))
                {
                        found =1;
                        break;
                }
        }
        if (found == 0)
        {
                diff[k] = new Array();
                diff[k][0] = p1;
                diff[k][1] = p2;
                diff[k][2] = p3;
                k++;
        }
     }
     return diff;
  }



  function update(data) {
    connectedMeters = normalizeOctets(data);
    allMeters = getMeters();
    disconnectedMeters = compare(allMeters,connectedMeters);

    var input = document.getElementById("myList");

    var replacement = document.createElement('li');
    replacement.id = "myList";
    replacement.name = "myList";

    for (var i in disconnectedMeters )
    {

                var node=document.createElement("LI");
                var textnode=document.createTextNode("address:" + disconnectedMeters[i][0] + "  id:" + disconnectedMeters[i][1] + "  name:" + disconnectedMeters[i][2]);
                node.appendChild(textnode);
                replacement.appendChild(node);
    }
    input.parentElement.replaceChild(replacement,input);

  }

  function subscribe() {
    /* subscribe to the dataSource, passing the function to call when updates
       are recieved from the Streaming API */
    subscription = meterStatusData.addSubscriber(update);

    document.getElementById('subscribe').disabled = true;
    document.getElementById('unsubscribe').disabled = false;
  }

  function unsubscribe() {
    // unsubscribe from the data source using the subscription id we stored earlier
    meterStatusData.removeSubscriber(subscription);

    subscription = null;
    document.getElementById('subscribe').disabled = false;
    document.getElementById('unsubscribe').disabled = true;
  }


  document.getElementById('subscribe').onclick = subscribe;
  document.getElementById('unsubscribe').onclick = unsubscribe;
  function log(msg) {
    setTimeout(function() {
        throw new Error(msg);
    }, 0);
  }

  function base64_encode (data) {
  // http://kevin.vanzonneveld.net
  // +   original by: Tyler Akins (http://rumkin.com)
  // +   improved by: Bayron Guevara
  // +   improved by: Thunder.m
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Pellentesque Malesuada
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Rafał Kukawski (http://kukawski.pl)
  // *     example 1: base64_encode('Kevin van Zonneveld');
  // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
  // mozilla has this native
  // - but breaks in 2.0.0.12!
  //if (typeof this.window['btoa'] == 'function') {
  //    return btoa(data);
  //}
  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = "",
    tmp_arr = [];

  if (!data) {
    return data;
  }

  do { // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = o1 << 16 | o2 << 8 | o3;

    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;

    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join('');

  var r = data.length % 3;

  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

  }




  // kick everything off by subscribing the graph to the datasource
  subscribe();
};

