﻿define(function(require) {
    var data = require('services/dataservice'),
        shell = require('viewmodels/shell');

    var vm = {
        inspectors: ko.observableArray([]),
        activate: function() {
            shell.title("Breeze Inspector");
            shell.status('');
        },
        selectInspector: function(inspector) {
            shell.inspector(inspector);
            shell.navigate('joblist');
        }
    };

    data.getInspectors().then(function(response) {
        vm.inspectors(response.results);
    });

    return vm;
});