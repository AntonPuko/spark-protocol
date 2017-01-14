'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _binaryVersionReader = require('binary-version-reader');

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

var _settings3 = require('../../third-party/settings');

var _settings4 = _interopRequireDefault(_settings3);

var _specifications = require('../../third-party/specifications');

var _specifications2 = _interopRequireDefault(_specifications);

var _versions = require('../../third-party/versions');

var _versions2 = _interopRequireDefault(_versions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var platformSettings = (0, _entries2.default)(_specifications2.default);
var SPECIFICATION_KEY_BY_PLATFORM = new _map2.default((0, _values2.default)(_settings4.default.knownPlatforms).map(function (platform) {
  var spec = platformSettings.find(function (_ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return value.productName === platform;
  });

  return [platform, spec && spec[0]];
}).filter(function (item) {
  return item[1];
}));
var FIRMWARE_VERSION = _versions2.default.find(function (version) {
  return version[1] === _settings4.default.versionNumber;
})[0];

var FirmwareManager = function () {
  function FirmwareManager() {
    (0, _classCallCheck3.default)(this, FirmwareManager);
  }

  (0, _createClass3.default)(FirmwareManager, [{
    key: 'getKnownAppFileName',
    value: function getKnownAppFileName() {
      throw new Error('getKnownAppFileName has not been implemented.');
    }
  }], [{
    key: 'getOtaUpdateConfig',
    value: function getOtaUpdateConfig(platformID) {
      var platform = _settings4.default.knownPlatforms[platformID + ''];
      var key = SPECIFICATION_KEY_BY_PLATFORM.get(platform);

      if (!key) {
        return null;
      }

      var firmwareSettings = _settings4.default.updates[key];
      if (!key) {
        return null;
      }

      var firmwareKeys = (0, _keys2.default)(firmwareSettings);
      return firmwareKeys.map(function (firmwareKey) {
        return (0, _extends3.default)({}, _specifications2.default[key][firmwareKey], {
          binaryFileName: firmwareSettings[firmwareKey]
        });
      });
    }
  }]);
  return FirmwareManager;
}();

FirmwareManager.runOtaSystemUpdates = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(device) {
    var systemInformation, parser, platformID, systemVersion, modules, moduleToUpdate, otaUpdateConfig, moduleIndex, config, systemFile;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return device.getSystemInformation();

          case 2:
            _context.t0 = _context.sent;
            systemInformation = (0, _nullthrows2.default)(_context.t0);
            parser = new _binaryVersionReader.HalDescribeParser();
            platformID = systemInformation.p;
            systemVersion = parser.getSystemVersion(systemInformation);
            modules = parser.getModules(systemInformation)
            // Filter so we only have the system modules
            .filter(function (module) {
              return module.func === 's';
            });

            if (modules) {
              _context.next = 10;
              break;
            }

            throw new Error('Could not find any system modules for OTA update');

          case 10:
            moduleToUpdate = modules.find(function (module) {
              return module.version < FIRMWARE_VERSION;
            });

            if (modules) {
              _context.next = 13;
              break;
            }

            throw new Error('All modules appear to be updated.');

          case 13:
            otaUpdateConfig = FirmwareManager.getOtaUpdateConfig(platformID);

            if (otaUpdateConfig) {
              _context.next = 16;
              break;
            }

            throw new Error('Could not find OTA update config for device');

          case 16:
            moduleIndex = modules.indexOf(moduleToUpdate);
            config = otaUpdateConfig[moduleIndex];
            systemFile = _fs2.default.readFileSync(_settings2.default.BINARIES_DIRECTORY + '/' + config.binaryFileName);

            console.log('FLASHING', systemFile.length, config.binaryFileName);
            _context.next = 22;
            return device.flash(systemFile);

          case 22:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref3.apply(this, arguments);
  };
}();

exports.default = FirmwareManager;