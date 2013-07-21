window.onload = function () {

  var meterStatusData = bndry.dataSource.create('meter_status'),
      subscription = null
        ;

  /*
     Processes the state field into a more useful form for drawing a bar graph over a time interval.
     For the volume_1s query, the state key is the timestamp of the sample.
  */
  function normalizeOctets (data, callback) {
    var meterArray = new Array();
    var i = 0;
    for (var key in data.state)
    {
        if ( data.state.hasOwnProperty(key))
        {
                        meterArray[i] = new Array();
                        meterArray[i][0] = data.state[key]["exportAddress"];
                        meterArray[i][1] = data.state[key]["meterId"];
                        meterArray[i][2] = data.state[key]["connected"];
                i = i + 1 ;
        }

    }
    return meterArray;
  }

  function update(data) {
    data = normalizeOctets(data);

    var input = document.getElementById("myList");

    var replacement = document.createElement('li');
    replacement.id = "myList";
    replacement.name = "myList";

    for (var i in data )
    {

                var node=document.createElement("LI");
                var textnode=document.createTextNode("address:" + data[i][0] + " ,id:" + data[i][1] + " ,connected:" + data[i][2]);
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
  // kick everything off by subscribing the graph to the datasource
  subscribe();
};

