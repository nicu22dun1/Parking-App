// Define payParking controller for payParking application
payParking.controller('payParkingController', function payParkingController($scope, localStorageService) {

    // Initial setup
    $scope.parkingLotName      = 'Parking App - Hincu Nicusor';
    $scope.totalParkingLots    = 10;
    $scope.priceFirstHour      = 10;
    $scope.pricePerHour        = 5;
    $scope.parkingLotConfig = {
        'totalParkingLots' : $scope.totalParkingLots,
        'priceFirstHour'   : $scope.priceFirstHour,
        'pricePerHour'     : $scope.pricePerHour,
        'parkingLotName'   : $scope.parkingLotName
    };

    localStorageService.add(0, $scope.parkingLotConfig);

    $scope.booleanEnterForm    = false;
    $scope.booleanLeaveForm    = false;
    $scope.showSuccessEnter    = false;
    $scope.showSuccessLeave    = false;
    $scope.showInvalidNumber   = false;
    $scope.showCarNumberExists = false;
    $scope.showSummary         = false;
    $scope.showConfig          = false;

    // regex for Bucharest and other counties
    var checkBucharestRegex = '^[bB]{1}[0-9]{2,3}[A-z]{3}';
    var checkCountiesRegex = '^[A-z]{2}[0-9]{2}[A-z]{3}';

    // Public Functions
    $scope.showEnterForm            = showEnterForm;
    $scope.showLeaveForm            = showLeaveForm;
    $scope.occupyParkingLotSpace    = occupyParkingLotSpace;
    $scope.emptyParkingLotSpace     = emptyParkingLotSpace;
    $scope.availableParkingSpacesNo = getAvailableParkingSpotsNr;
    $scope.clearData                = clearData;
    $scope.updateParkingLotSpaces   = updateParkingLotSpaces;
    $scope.closeSummary             = closeSummary;
    $scope.confirmConfig            = confirmConfig;

    updateParkingLotSpaces();

    // Functions
    function getAvailableParkingLotSpaceId(){
        var keys = localStorageService.keys();
        for(i = 1; i <= localStorageService.get(0).totalParkingLots; i++){
            if( !keys.includes(i.toString()) ){
                return i;
            }
        };
        return null;
    };

    function getParkingLotSpaceIdForCarNumber (carNumber){
        var keys = localStorageService.keys();
        var parkingLotId = '';
        keys.forEach(function(item, index){
            if(item != 0){
                if(localStorageService.get(item).carNumber == carNumber){
                    parkingLotId = item; // return the parking lot space ID for the car to be removed
                };
            };
        });
        return parkingLotId??null;
    };

    function getParkingLotSpaces(){
        var parkingSpaces = [];
        for(i = 1; i <= localStorageService.get(0).totalParkingLots; i++){
            if( localStorageService.keys().includes(i.toString()) ){ // check if parking space is ocupied when iterating
                parkingSpaces.push({
                    'carNumber' : localStorageService.get(i).carNumber,
                    'entryDate' : localStorageService.get(i).entryDate
                });
            }else{
                parkingSpaces.push({
                    'carNumber' : '',
                    'entryDate' : ''
                });
            }
        };
        return parkingSpaces;
    };

    function getAvailableParkingSpotsNr(){
        return localStorageService.get(0).totalParkingLots - (localStorageService.length() - 1);
    };

    function updateParkingLotSpaces(){
        $scope.parkingLotSpaces = getParkingLotSpaces();
        $scope.availableParkingSpacesNo = getAvailableParkingSpotsNr();
    };

    function showEnterForm (){
        $scope.booleanEnterForm = true;
        $scope.booleanLeaveForm = false;
        if( $scope.showSuccessEnter == true ){
            $scope.showSuccessEnter = !$scope.showSuccessEnter;
        };
        if( $scope.showSuccessLeave == true ){
            $scope.showSuccessLeave = false;
        };
    };

    function showLeaveForm (){
        $scope.booleanLeaveForm = true;
        $scope.booleanEnterForm = false;
        if( $scope.showSuccessEnter == true ){
            $scope.showSuccessEnter = false;
        };
        if( $scope.showSuccessLeave == true ){
            $scope.showSuccessLeave = false;
        };
        $scope.message = '';
    };

    function occupyParkingLotSpace (carNumber){
        carNumber = carNumber.toUpperCase();
        var licensePlateRegex = chooseRegex(carNumber);

        if( carNumber.search(licensePlateRegex) != -1 ){ // if pattern found ( bucharest, others )
            if( getParkingLotSpaceIdForCarNumber(carNumber) ){ // verify if car is already in parking lot, null if not
                $scope.message = 'Masina cu numarul de inmatriculare '+ carNumber +' exista deja in parcare! Va rugam verificati numarul introdus.';
                $scope.messageType = false;
            }else{
                var date = Math.round(new Date().getTime() / 1000); // get current date
                var parkingLotSpaceId = getAvailableParkingLotSpaceId();
                localStorageService.add(parkingLotSpaceId, 
                    {
                        'carNumber': carNumber,
                        'entryDate': date
                    }
                );
                $scope.message = 'A fost alocat locul de parcare #'+ parkingLotSpaceId +' pentru masina cu numarul de inmatriculare '+ carNumber +'!';
                $scope.messageType = true;

                $scope.booleanEnterForm = false;
            };
        }else{
            $scope.message = 'Numarul de inmatriculare '+ carNumber +' nu este corect!';
            $scope.messageType = false;
        };

        $scope.booleanLeaveForm = false;
        updateParkingLotSpaces();
    };

    function emptyParkingLotSpace (carNumber){
        carNumber = carNumber.toUpperCase();
        var licensePlateRegex = chooseRegex(carNumber);

        if( carNumber.search(licensePlateRegex) != -1 ){ // if pattern found ( bucharest, others )
            
            var parkingLotSpaceId = getParkingLotSpaceIdForCarNumber(carNumber);
            if ( !parkingLotSpaceId ){
                $scope.message = 'Masina cu numarul de inmatriculare '+ carNumber +' nu exista in parcare!';
                $scope.messageType = false;
            }else{
                $scope.summary = calculateSummary(localStorageService.get(parkingLotSpaceId).entryDate, carNumber, parkingLotSpaceId);
                localStorageService.remove(parkingLotSpaceId); // remove car from parking space

                $scope.showSummary = true;
                $scope.booleanLeaveForm = false;
            };
            
        }else{
            $scope.message = 'Numarul de inmatriculare '+ carNumber +' nu este corect!';
            $scope.messageType = false;
        };
        updateParkingLotSpaces();
    };

    function clearData(){
        localStorageService.clearAll();
        location.reload();
    };

    function chooseRegex(carNumber){

        return carNumber.substr(1,1).search(/[0-9]/) != -1 ? checkBucharestRegex : checkCountiesRegex;

    };

    function calculateSummary(entryTime, carNumber, parkingLotSpaceId){
        var priceFirstHour = $scope.priceFirstHour;
        var pricePerHour   = $scope.pricePerHour;
        var date = Math.round(new Date().getTime() / 1000); // get current date for summary in seconds
        var summary = {};
        summary.entryDate       = timeConverterUnixToDate(entryTime);
        summary.leaveDate       = timeConverterUnixToDate(date);
        summary.carNumber       = carNumber;
        summary.parkingLotName  = $scope.parkingLotName;
        summary.parkingLotSpaceId = parkingLotSpaceId;

        var minutesElapsed = Math.ceil((date - entryTime) / 60); // no. minutes
        if( minutesElapsed <= 60 ){
            summary.totalInvoiceValue = priceFirstHour;
            if( minutesElapsed == 1 ){
                summary.subsequentTimeString = minutesElapsed.toString() + ' minut';
            }else{
                summary.subsequentTimeString = minutesElapsed.toString() + ' minute';
            }
        }else{
            var elapsedHours = Math.floor(minutesElapsed / 60);
            var subsequentMinutes = Math.ceil(minutesElapsed % 60);

            summary.subsequentTimeString = elapsedHours.toString() + ' ore ' + (subsequentMinutes == 0 ? 'si 0 minute' : ( 'si ' + subsequentMinutes.toString() + ' minute'));
            summary.totalInvoiceValue = priceFirstHour + ( Math.ceil((minutesElapsed - 60) / 60) * pricePerHour );
        }
        return summary;
    };

    function timeConverterUnixToDate(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    };

    function closeSummary(){
        $scope.showSummary = false;
        $scope.summary     = '';
        $scope.message     = '';
    };

    function confirmConfig(){
        $scope.showConfig = false;
        $scope.parkingLotConfig = {
            'totalParkingLots' : $scope.totalParkingLots,
            'priceFirstHour'   : $scope.priceFirstHour,
            'pricePerHour'     : $scope.pricePerHour,
            'parkingLotName'   : $scope.parkingLotName
        };
        
        localStorageService.add('0', $scope.parkingLotConfig);
        updateParkingLotSpaces();
    };

});