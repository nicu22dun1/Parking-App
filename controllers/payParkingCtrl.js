// Define payParking controller for payParking application
payParking.controller('payParkingController', function payParkingController($scope, localStorageService) {

    // Initial setup config

    if( localStorageService.keys()[0] ){
        $scope.parkingLotName   = localStorageService.get(0).parkingLotName;
        $scope.pricePerHour     = localStorageService.get(0).pricePerHour;
        $scope.priceFirstHour   = localStorageService.get(0).priceFirstHour;
        $scope.totalParkingLots = localStorageService.get(0).totalParkingLots;

        $scope.availableParkingSpacesNo = getAvailableParkingSpotsNr();

        updateParkingLotSpaces();

    } else { // default config values
        $scope.parkingLotName      = 'Parking App - Hincu Nicusor';
        $scope.totalParkingLots    = 10;
        $scope.priceFirstHour      = 10;
        $scope.pricePerHour        = 5;
        $scope.showConfig          = true;

    };

    $scope.parkingLotConfig = {
        'totalParkingLots' : $scope.totalParkingLots,
        'priceFirstHour'   : $scope.priceFirstHour,
        'pricePerHour'     : $scope.pricePerHour,
        'parkingLotName'   : $scope.parkingLotName
    };

    // regex for Bucharest and other counties
    var checkBucharestRegex = '^[bB]{1}[0-9]{2,3}[A-Za-z]{3}';
    var checkCountiesRegex  = '^[A-z]{2}[0-9]{2}[A-z]{3}';

    // Public Functions
    $scope.showEnterForm            = showEnterForm;
    $scope.showLeaveForm            = showLeaveForm;
    $scope.occupyParkingLotSpace    = occupyParkingLotSpace;
    $scope.emptyParkingLotSpace     = emptyParkingLotSpace;
    $scope.clearData                = clearData;
    $scope.updateParkingLotSpaces   = updateParkingLotSpaces;
    $scope.closeSummary             = closeSummary;
    $scope.confirmConfig            = confirmConfig;

    // Functions

    /**
     * Get available parking lot space.
     * 
     * @returns {number}/null Parking lot Id
     */
    function getAvailableParkingLotSpaceId(){
        var keys = localStorageService.keys();
        for( i = 1; i <= localStorageService.get(0).totalParkingLots; i++ ){
            if( !keys.includes(i.toString()) )
                return i;
        };

        return null;
    };
    
    /**
     * Get parking lot space Id for specified license plate.
     * 
     * @param {string} carNumber
     * @returns {number}/null Parking lot space Id 
     */
    function getParkingLotSpaceIdForCarNumber (carNumber){
        var keys = localStorageService.keys();
        var parkingLotId = '';
        keys.forEach(function(item, index){
            if( item != 0 )
                if( localStorageService.get(item).carNumber == carNumber )
                    parkingLotId = item; // return the parking lot space ID for the car to be removed
        });

        return parkingLotId??null;
    };

    /**
     * Go through stored data to get parking spaces details.
     * 
     * @returns {object} Parking lot spaces.
     */
    function getParkingLotSpaces(){
        var parkingSpaces = [];
        for( i = 1; i <= localStorageService.get(0).totalParkingLots; i++ ){
            if( localStorageService.keys().includes( i.toString() ) ){ // check if parking space is ocupied when iterating
                parkingSpaces.push({
                    'carNumber' : localStorageService.get(i).carNumber,
                    'entryDate' : localStorageService.get(i).entryDate
                });
            } else {
                parkingSpaces.push({
                    'carNumber' : '',
                    'entryDate' : ''
                });
            };
        };

        return parkingSpaces;
    };

    /**
     * @returns {number} No. of available parking spots.
     */
    function getAvailableParkingSpotsNr(){
        return localStorageService.get(0).totalParkingLots - ( localStorageService.length() - 1 );
    };

    /**
     * Set parking lot spaces in scope.
     * Set available number of parking spots in scope.
     */
    function updateParkingLotSpaces(){
        $scope.parkingLotSpaces = getParkingLotSpaces();
        $scope.availableParkingSpacesNo = getAvailableParkingSpotsNr();
    };

    /**
     * Shows the parking entry form.
     * Hides the parking leave form.
     * Clears messages.
     */
    function showEnterForm (){
        $scope.booleanEnterForm = true;
        $scope.booleanLeaveForm = false;

        $scope.message = '';
    };

    /**
     * Shows the parking leave form.
     * Hides the parking entry form.
     * Clears messages.
     */
    function showLeaveForm (){
        $scope.booleanLeaveForm = true;
        $scope.booleanEnterForm = false;

        $scope.message = '';
    };

    /**
     * Occupy a parking lot space for a specified license plate.
     * Updates parking lot spaces from storage.
     * Hides the parking entry form if successfull.
     * Updates messages.
     * 
     * @param {string} carNumber
     */
    function occupyParkingLotSpace (carNumber){
        carNumber = carNumber.toUpperCase();
        var licensePlateRegex = chooseRegex(carNumber);

        if( carNumber.search(licensePlateRegex) != -1 ){ // if pattern found ( bucharest, others )
            if( getParkingLotSpaceIdForCarNumber(carNumber) ){ // verify if car is already in parking lot, null if not
                $scope.message = 'Masina cu numarul de inmatriculare '+ carNumber +' exista deja in parcare! Va rugam verificati numarul introdus.';
                $scope.messageType = false;
            } else {
                var date = Math.round( new Date().getTime() / 1000 ); // get current date
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
        } else {
            $scope.message = 'Numarul de inmatriculare '+ carNumber +' nu este corect!';
            $scope.messageType = false;
        };

        $scope.booleanLeaveForm = false;
        updateParkingLotSpaces();
    };

    /**
     * Empty the parking lot space for a specified license plate.
     * Updates parking lot spaces from storage.
     * Hides the parking leave form if successfull.
     * Updates messages.
     * 
     * @param {string} carNumber 
     */
    function emptyParkingLotSpace (carNumber){
        carNumber = carNumber.toUpperCase();
        var licensePlateRegex = chooseRegex(carNumber);

        if( carNumber.search(licensePlateRegex) != -1 ){ // if pattern found ( bucharest, others )
            
            var parkingLotSpaceId = getParkingLotSpaceIdForCarNumber(carNumber);
            if ( !parkingLotSpaceId ){
                $scope.message = 'Masina cu numarul de inmatriculare '+ carNumber +' nu exista in parcare!';
                $scope.messageType = false;
            } else {
                $scope.summary = calculateSummary(localStorageService.get(parkingLotSpaceId).entryDate, carNumber, parkingLotSpaceId);
                localStorageService.remove(parkingLotSpaceId); // remove car from parking space

                $scope.showSummary = true;
                $scope.booleanLeaveForm = false;
            };
        } else {
            $scope.message = 'Numarul de inmatriculare '+ carNumber +' nu este corect!';
            $scope.messageType = false;
        };

        updateParkingLotSpaces();

    };

    /**
     * Clears storage and reinitialises the application.
     */
    function clearData(){
        localStorageService.clearAll();
        location.reload();
    };

    /** 
     * Set correct Regex for a license plate format.
     * 
     * @param {string} carNumber
     * 
     * @returns {string} Regex
     */
    function chooseRegex(carNumber){
        return carNumber.substr(1,1).search(/[0-9]/) != -1 ? checkBucharestRegex : checkCountiesRegex;
    };

    /**
     * Calculates time elapsed since entry in parking lot space.
     * Calculates total invoice value.
     * Creates message for calculated duration.
     * 
     * @param {UNIX Timestamp} entryTime 
     * @param {string} carNumber 
     * @param {number} parkingLotSpaceId
     * 
     * @returns {object} Summary
     */
    function calculateSummary(entryTime, carNumber, parkingLotSpaceId){
        var priceFirstHour = localStorageService.get(0).priceFirstHour;
        var pricePerHour   = localStorageService.get(0).pricePerHour;
        var date           = Math.round( new Date().getTime() / 1000 ); // get current date for summary in seconds
        
        var summary               = {};
        summary.entryDate         = timeConverterUnixToDate(entryTime);
        summary.leaveDate         = timeConverterUnixToDate(date);
        summary.carNumber         = carNumber;
        summary.parkingLotName    = $scope.parkingLotName;
        summary.parkingLotSpaceId = parkingLotSpaceId;

        var minutesElapsed = Math.ceil( (date - entryTime) / 60 ); // no. minutes
        if( minutesElapsed <= 60 ){
            summary.totalInvoiceValue = priceFirstHour;
            if( minutesElapsed == 1 ){
                summary.subsequentTimeString = minutesElapsed.toString() + ' minut';
            } else {
                summary.subsequentTimeString = minutesElapsed.toString() + ' minute';
            }
        } else {
            var elapsedHours = Math.floor( minutesElapsed / 60 );
            var subsequentMinutes = Math.ceil( minutesElapsed % 60 );

            summary.subsequentTimeString = elapsedHours.toString() + ' ore ' + (subsequentMinutes == 0 ? 'si 0 minute' : ( 'si ' + subsequentMinutes.toString() + ' minute'));
            summary.totalInvoiceValue = priceFirstHour + ( Math.ceil((minutesElapsed - 60) / 60) * pricePerHour );
        }

        return summary;
    };

    /**
     * Converts UNIX timestamp to readable format.
     * 
     * @param {UNIX Timestamp} UNIX_timestamp
     * 
     * @returns {string} Detailed time
     */
    function timeConverterUnixToDate(UNIX_timestamp){
        var a      = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year   = a.getFullYear();
        var month  = months[a.getMonth()];
        var date   = a.getDate();
        var hour   = a.getHours();
        var min    = a.getMinutes();
        var sec    = a.getSeconds();
        var time   = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;

        return time;

    };

    /**
     * Closes the summary.
     * Clears the summary object.
     * Updates message.
     */
    function closeSummary(){
        $scope.showSummary = false;
        $scope.summary     = '';
        $scope.message     = '';
    };

    /**
     * Closes the config.
     * Stores config object with data inserted.
     * Updates parking lot spaces.
     */
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