'use strict';

impress.events = {};

impress.events.mixinApplication = function(application) {

  application.events = {
    channels: {},     // event channels indexed by channel name, channel is an array of logins
    statistics: {
      personal: 0,  // sent using .sendToUser
      channel:  0,  // sent using .sendToChannel
      global:   0   // sent using .sendGlobal
    }
  };

  // Send event to all connections of given user
  //
  application.events.sendToUser = function(login, eventName, data, isRetranslation) {
    isRetranslation = isRetranslation || false;
    if (api.cluster.isWorker && !isRetranslation) process.send({
      name: 'impress:event',
      node: impress.nodeId,
      appName: application.name,
      user: login,
      event: eventName,
      data: data
    });
    if (application.sse) application.sse.sendToUser(login, eventName, data);
  };

  // Send event to all users in channel
  //
  application.events.sendToChannel = function(channel, eventName, data, isRetranslation) {
    isRetranslation = isRetranslation || false;
    if (api.cluster.isWorker && !isRetranslation) process.send({
      name: 'impress:event',
      node: impress.nodeId,
      appName: application.name,
      channel: channel,
      event: eventName,
      data: data
    });
    if (application.sse) application.sse.sendToChannel(channel, eventName, data);
  };

  // Send event to all users in system
  //
  application.events.sendGlobal = function(eventName, data, isRetranslation) {
    isRetranslation = isRetranslation || false;
    if (api.cluster.isWorker && !isRetranslation) process.send({
      name: 'impress:event',
      node: impress.nodeId,
      appName: application.name,
      global: true,
      event: eventName,
      data: data
    });
    if (application.sse) application.sse.sendGlobal(eventName, data);
  };

  // Send event to all processes at local server
  //
  application.events.sendToServer = function(eventName, data, isRetranslation) {
    isRetranslation = isRetranslation || false;
    if (api.cluster.isWorker && !isRetranslation) process.send({
      name: 'impress:event',
      node: impress.nodeId,
      appName: application.name,
      server: true,
      event: eventName,
      data: data
    });
    // Add prefix to event name 'impress:event'
    application.emit(eventName, data);
  };

};
