# price-calendar

A calendar can render prices or events

## Usage

Initialize the plugin on the element

```
   $(function(){
   
        $('#calendar').calendar(options);
   
   });      
    
```

## Options

Default option are:

```   
    var default = {
        date: null, // active day
        firstDay: 1, // from which day
        minDate: null, // minDate
        maxDate: null, // maxDate
        // the sample data:[{date:'2015-01-01',id:1, price:'100.00'}]
        dateData: null,
        monthChangeable: false,
        yearChangeable: false
    }  
```

## Events

Select a day:

```
   $('#calendar').on('select', function (e, dateStr, cell) {
       console.log('select');
   });
```

Change year or month:

```
    $('#calendar').on('monthChange', function (e, month, year) {
       console.log('monthChange');
    });
```

Render the price data on each day:

```
    $('#calendar').on('renderData', function (e, data, dateStr) {
      console.log('renderData');
    });
```
