/*
Dependencies:
- jQuery
- Hammer
- jQuery.lazyload
*/

$(function() {
  fetch();
  //Lazyload
  $('.js-lazyload').lazyload({
    effect: 'fadeIn',
    threshold: 50,
  });

  //Globals
  var $topCard,
    //deltaThreshold is the swipe distance from the initial place of the card
    deltaThreshold = 100,
  	deltaX = 0;

  function swipeEnded(event, direction, $card) {
  	var  directionFactor,
  		   transform;
    //If the event has a type, then it is triggered from a button and has a given direction
    if (event.type === 'click') {
      directionFactor = direction === 'right' ? -1 : 1;
    }
    //If the event has a deltaX, then it is triggered from a gesture and has a calculated direction
    else if (event.deltaX) {
      directionFactor = event.deltaX >= 0 ? -1 : 1;
    }

  	//If the threshold is reached or a trigger clicked, the card is thrown on a side and then disappear
  	if ( event.deltaX && deltaX > deltaThreshold || event.deltaX && deltaX < -1 * deltaThreshold || direction) {
  		transform = 'translate(' + directionFactor * -100 + 'vw, 0) rotate(' + directionFactor * -5 + 'deg)';
  		$card
         .delay(100)
         .queue(function () {
           $(this).css('transform', transform).dequeue();
         })
         .delay(300)
         .queue(function () {
           $(this).addClass('done').remove();
         });

       //Do something
  		console.log('Swipe done. \nCard:', $card, '\nDirection:', directionFactor);
      if (directionFactor === 1) {
        confirm('This will reject the document and trigger an email to customer. Are you sure?')
        console.log('Left');
        $.ajax({
  url: '/reject_doc/' + localStorage['documentID'],
  type: 'GET',
  success: function(data) {
    fetch();
  }
});

      } else if (directionFactor === -1) {
        console.log('Right');
        $.ajax({
  url: '/accept_doc/' + localStorage['documentID'],
  type: 'GET',
  success: function(data) {
    fetch();
  }
});
      }

  	}
  	//If the threshold isn't reached, the card goes back to its initial place
  	else {
  		transform = 'translate(0, 0) rotate(0)';
  		$card.css({
  			'transform': transform,
  		});
  	}
  }

  function swipeLeft(event, $card) {
  var transform;
  deltaX = event.deltaX;
  transform = 'translate(' + deltaX * 0.8 + 'px, 0) rotate(5deg)';
  //translate the card on swipe
  $card.css({
    'transform': transform,
  });
}

function swipeRight(event, $card) {
  var transform;
  deltaX = event.deltaX;
  transform = 'translate(' + deltaX * 0.8 + 'px, 0) rotate(-5deg)';
  //translate the card on swipe
  $card.css({
    'transform': transform,
  });
}

//Events
$('.js-swiping-card').each(function(index, element) {
  var $card = $(element),
    //Add hammer events on element
    hammertime = new Hammer(element);

  //Mobile gesture
  hammertime.on('panleft swipeleft', function(event) {
    swipeLeft(event, $card);
  });
  hammertime.on('panright swiperight', function(event) {
    swipeRight(event, $card);
  });
  hammertime.on('panend', function(event) {
    swipeEnded(event, false, $card);
  });
});

  //Btn controls
  $('.js-left-trigger').on('click', function(event) {
    var $topCard= $('.js-swiping-card').last();
    swipeEnded(event, 'left', $topCard);
  });
  $('.js-right-trigger').on('click', function(event) {
    var $topCard = $('.js-swiping-card').last();
    swipeEnded(event, 'right', $topCard);
  });
});

$('.btn-default').on('click',function(event) {
  fetch();
});

function fetch() {
  $.get(
  "/fetch_image",
  function(data) {
    if (data) {
      console.log(data);
      var json = $.parseJSON(data);
      var ele = "<div id='card' class='card js-swiping-card' " + "style='touch-action: pan-y; user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); transform: translate(0px, 0px) rotate(0deg);'>" +
    "<div class='card-illustration js-lazyload' style='display: block; background-image: url(&quot;" + json.documentURL + "&quot;);'></div>"
  + "</div>";
  $("#docs").append(ele);
    localStorage['documentID'] = json.documentId;
    localStorage['documentURL'] = json.documentURL;
    }
  }
);
}
