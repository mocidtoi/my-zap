import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './main.html';

var joinInfoRV = new ReactiveVar("");
var jEndpointRV = new ReactiveVar("");

/* global notifier */
/* global EventDDP */
notifier = new EventDDP("notification");

notifier.addListener('permitjoin', function(message) {
    console.log(message);
});
notifier.addListener('cresponse', function(message) {
    console.log(message);
});
notifier.addListener('joininfo', function(message){
    console.log(message);
    joinInfoRV.set(message);
});

Template.remotelog.onCreated(function() {
    var template = this;
    notifier.addListener('rawdata', function(message){
        console.log(message);
        template.$("#log").append("<br/>" + message);
    });
});
Template.remotelog.helpers({
    dummy: function() { return ""; }
});
Template.remotelog.events({
});

Template.pjcontrol.helpers({
    joininfo: function() {
        return joinInfoRV.get();
    }
});

Template.pjcontrol.events({
    'click button': function() {
        Meteor.call('permitjoin', 20);
    }
});

Template.cmdcontrol.helpers({
});
Template.cmdcontrol.events({
    'click button#on': function() {
        var buttonId = "" + Template.instance().find("#btnIdInput").value;
        var address = Template.instance().find("#addrInput").value;
        var endpoint = Template.instance().find("#endpointInput").value;
        console.log("Button on clicked: buttonId" + buttonId + " address:" + address + " endpoint:" + endpoint);
        Meteor.call("on", buttonId, address, endpoint);
    },
    'click button#off': function() {
        var buttonId = "" + Template.instance().find("#btnIdInput").value;
        var address = Template.instance().find("#addrInput").value;
        var endpoint = Template.instance().find("#endpointInput").value;
        console.log("Button off clicked: buttonId" + buttonId + " address:" + address + " endpoint:" + endpoint);
        Meteor.call("off", buttonId, address, endpoint);
    },
    'click button#check': function() {
        var buttonId = "" + Template.instance().find("#btnIdInput").value;
        var address = Template.instance().find("#addrInput").value;
        var endpoint = Template.instance().find("#endpointInput").value;
        console.log("Button check clicked: buttonId" + buttonId + " address:" + address + " endpoint:" + endpoint);
        Meteor.call("checkStatus", buttonId, address, endpoint);
    }
});
