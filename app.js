'use strict';

// Define payParking app
var payParking = angular.module('payParking', ['LocalStorageModule']);

payParking.config(function(localStorageServiceProvider){
    localStorageServiceProvider.setPrefix('parkingPrefix');
});