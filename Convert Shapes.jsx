/*
 * The MIT License
 *
 * Copyright (c) 2017-2019 Kyle Martinez http://www.kyle-martinez.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

(function(thisObj) {

    /*************************************************************************
     * Initialize Functions **************************************************
     *************************************************************************/
    function Script (thisObj) {
        this.name = "Convert Shapes";
        this.version = "1.8";
        this.thisObj = thisObj;
    }

    Script.prototype.init = function () {
        this.createMainWindow();
        this.populateMainWindow();
        this.showMainWindow();
    };

    /*************************************************************************
     * User Interface Functions **********************************************
     *************************************************************************/
    Script.prototype.createMainWindow = function () {
        this.win = (this.thisObj instanceof Panel) ? this.thisObj : new Window("palette", this.name, undefined, {resizeable: true});
        this.win.alignChildren = ["left", "top"];
        this.win.orientation = "column";
        this.win.spacing = 10;
    };

    Script.prototype.populateMainWindow = function () {
        var _this = this;

        var parametricGroup = this.win.add("panel", undefined, "Convert to Parametric");
            parametricGroup.alignChildren = ["fill", "fill"];
            parametricGroup.orientation = "row";
            parametricGroup.margins = 15;
            parametricGroup.spacing = 15;

        var parametricRectangleButton = parametricGroup.add("button", undefined, "Rectangle");
            parametricRectangleButton.preferredSize = [80, 26];
            parametricRectangleButton.helpTip = "Click - Convert selected shape(s) to a parametric rectangle";
            parametricRectangleButton.onClick = function () {
                _this.createParametricShape("rectangle");
            }

        var parametricCircleButton = parametricGroup.add("button", undefined, "Circle");
            parametricCircleButton.preferredSize = [80, 25];
            parametricCircleButton.helpTip = "Click - Convert selected shape(s) to a parametric circle\nALT + Click - Convert selected shape(s) to a parametric rounded rectangle";
            parametricCircleButton.onClick = function () {
                _this.createParametricShape("circle");
            }

        var bezierGroup = this.win.add("panel", undefined, "Convert to Bezier");
            bezierGroup.alignChildren = ["fill", "fill"];
            bezierGroup.orientation = "row";
            bezierGroup.margins = 15;
            bezierGroup.spacing = 15;

        var bezierRectangleButton = bezierGroup.add("button", undefined, "Rectangle");
            bezierRectangleButton.preferredSize = [80, 25];
            bezierRectangleButton.helpTip = "Click - Convert selected shape(s) to a bezier rectangle";
            bezierRectangleButton.onClick = function () {
                _this.createBezierShape("rectangle");
            }

        var bezierCircleButton = bezierGroup.add("button", undefined, "Circle");
            bezierCircleButton.preferredSize = [80, 25];
            bezierCircleButton.helpTip = "Click - Convert selected shape(s) to a bezier circle";
            bezierCircleButton.onClick = function () {
                _this.createBezierShape("circle");
            }

        var settingsButton = this.win.add("button", [0, 0, 25, 25], "?");
            settingsButton.helpTip = "Open Convert Shapes settings";
            settingsButton.onClick = function () {
                _this.openSettingsWindow();
            }

        this.win.layout.layout(true);
    };

    Script.prototype.showMainWindow = function () {
        if (this.win instanceof Window) {
            this.win.show();
        } else {
            this.win.layout.layout(true);
        }
    };

    Script.prototype.openSettingsWindow = function () {
        var win = new Window("dialog", this.name + " Settings");
            win.alignChildren = ["left", "top"];
            win.orientation = "column";

        var description = "Quickly convert simple bezier shapes to simple parametric shapes or quickly convert simple parametric shapes to bezier shapes. Simple shapes include rectangles, rounded rectangles, and circles. Circles can also be converted into rounded rectangles that appear to be circles. This is helpful for creating things such as eyes with a stylized blink.\n\nConvert Shapes now supports KBar.\n\nAdd a new KBar button that will Run JSX/JSXBIN File. You can use the same Convert Shapes.jsx file for every button. Add one of the following options as an argument:\n\nparametric rectangle\nparametric circle\nbezier rectangle\nbezier circle\nhelp\n\n" + this.name + " v" + this.version + " || Copyright 2017-" + new Date().getFullYear() + "\nDeveloped by Kyle Martinez || www.kyle-martinez.com";
            win.add("statictext", [0, 0, 500, 280], description, {multiline: true});

        var windowButtonGroup = win.add("group");
            windowButtonGroup.alignChildren = ["middle", "top"];
            windowButtonGroup.orientation = "row";
            windowButtonGroup.preferredSize.width = 500;

        var okayButton = windowButtonGroup.add("button", undefined, "Ok");
            okayButton.active = true;

        win.show();
    };

    /*************************************************************************
     * Help Functions ********************************************************
     *************************************************************************/
    Script.prototype.getActiveComp = function () {
        var comp = app.project.activeItem;
        if (comp == null || !(comp instanceof CompItem)) {
            throw this.name + "\nPlease select a composition";
        }
        return comp;
    };

    Script.prototype.getSelectedLayers = function (comp) {
        var layers = comp.selectedLayers;
        if (layers.length === 0) {
            throw this.name + "\nPlease select one or more layers";
        }
        return layers;
    };

    /*************************************************************************
     * Set Functions *********************************************************
     *************************************************************************/
    Script.prototype.setStrokeValues = function (stroke, styleValues) {
        stroke.property("ADBE Vector Stroke Color").setValue(styleValues.stroke.color);
        stroke.property("ADBE Vector Stroke Width").setValue(styleValues.stroke.width);
        stroke.property("ADBE Vector Stroke Line Cap").setValue(styleValues.stroke.cap);
        stroke.property("ADBE Vector Stroke Line Join").setValue(styleValues.stroke.join);
        return true;
    };

    Script.prototype.setFillValues = function (fill, styleValues) {
        fill.property("ADBE Vector Fill Color").setValue(styleValues.fill.color);
        return true;
    };

    /*************************************************************************
     * Get Functions *********************************************************
     *************************************************************************/
    Script.prototype.getBasicValues = function (layer) {
        return {
            width: layer.sourceRectAtTime(0, true).width,
            height: layer.sourceRectAtTime(0, true).height,
            position: layer.transform.position.value
        };
    };

    Script.prototype.getStokeValues = function (stroke) {
        return {
            color: stroke.property("ADBE Vector Stroke Color").value,
            width: stroke.property("ADBE Vector Stroke Width").value,
            cap: stroke.property("ADBE Vector Stroke Line Cap").value,
            join: stroke.property("ADBE Vector Stroke Line Join").value
        };
    };

    Script.prototype.getFillValues = function (fill) {
        return {
            color: fill.property("ADBE Vector Fill Color").value
        };
    };

    Script.prototype.getStyleValues = function (layer) {
        try {
            var stroke = layer.property("ADBE Root Vectors Group").property("ADBE Vector Group").property("ADBE Vectors Group").property("ADBE Vector Graphic - Stroke");
        } catch (err) {
            var stroke = null;
        }
        try {
            var fill = layer.property("ADBE Root Vectors Group").property("ADBE Vector Group").property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill");
        } catch (err) {
            var stroke = null;
        }
        var strokeProps = (stroke !== null && stroke.enabled === true) ? this.getStokeValues(stroke) : false;
        var fillProps = (fill !== null && fill.enabled === true) ? this.getFillValues(fill) : false;
        try {
            stroke.remove();
        } catch(err) {}
        try {
            fill.remove();
        } catch (err) {}
        layer.property("ADBE Root Vectors Group").property("ADBE Vector Group").property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
        return {
            stroke: strokeProps,
            fill: fillProps
        };
    };

    /*************************************************************************
     * Create Parametric Shape Functions *************************************
     *************************************************************************/
    Script.prototype.reverseTangentDisance = function (distance) {
        return Math.ceil(distance / (4 * (Math.sqrt(2) - 1) / 3));
    };

    Script.prototype.createParametricShapeGroup = function (layer, shapeLayer, shapeType, basicValues, isEllipse) {
        var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
        var shapeProperty = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - " + shapeType);
            shapeProperty.property("Size").setValue([basicValues.width, basicValues.height]);
        if (shapeType === "Rect" && isEllipse === false) {
            try {
                var path = layer.property("ADBE Root Vectors Group").property("ADBE Vector Group").property("ADBE Vectors Group").property("ADBE Vector Shape - Group").property("ADBE Vector Shape").value;
                var inTangent = path.inTangents[0];
                var outTangent = path.outTangents[0];
                var distance = Math.max(inTangent[0], inTangent[1], outTangent[0], outTangent[1]);
                var roundness = this.reverseTangentDisance(distance);
                shapeProperty.property("Roundness").setValue(roundness);
            } catch (err) {
                shapeProperty.property("Roundness").setValue(0);
            }
        }
        if (shapeType === "Rect" && isEllipse === true) {
            shapeProperty.property("Roundness").setValue(basicValues.width / 2);
        }
        return shapeGroup;
    };

    Script.prototype.createNewParametricShape = function (comp, layer, shapeType, isEllipse) {
        var styleValues = this.getStyleValues(layer);
        var basicValues = this.getBasicValues(layer);
        var shapeLayer = comp.layers.addShape();
            shapeLayer.property("ADBE Transform Group").property("ADBE Position").setValue(basicValues.position);
        var shapeGroup = this.createParametricShapeGroup(layer, shapeLayer, shapeType, basicValues, isEllipse);
        if (styleValues.stroke !== false) {
            var stroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
            this.setStrokeValues(stroke, styleValues);
        }
        if (styleValues.fill !== false) {
            var fill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
            this.setFillValues(fill, styleValues);
        }
        return shapeLayer;
    };

    Script.prototype.createParametricShape = function (shape) {
        try {
            app.beginUndoGroup("Convert to parametric " + shape);
            var altKey = ScriptUI.environment.keyboardState.altKey;
            var comp = this.getActiveComp();
            var layers = this.getSelectedLayers(comp);
            var numLayers = layers.length;
            for (var l = 0; l < numLayers; l++) {
                var layer = layers[l];
                var shapeType = (shape === "circle" && altKey === false) ? "Ellipse" : "Rect";
                var shapeLayer = this.createNewParametricShape(comp, layer, shapeType, altKey);
                    shapeLayer.moveBefore(layer);
                    shapeLayer.name = layer.name;
                    shapeLayer.label = layer.label;
                    shapeLayer.selected = false;
                layer.remove();
            }
        } catch (err) {
            alert(err);
        } finally {
            app.endUndoGroup();
        }
    };

    /*************************************************************************
     * Create Bezier Shape Functions *****************************************
     *************************************************************************/
    Script.prototype.tangentDistance = function (radius) {
        return Math.abs(radius) * 4 * (Math.sqrt(2) - 1) / 3;
    };

    Script.prototype.createBezierRectangleShape = function (layer, basicValues) {
        var halfWidth = basicValues.width / 2;
        var halfHeight = basicValues.height / 2;
        var roundness = layer.property("ADBE Root Vectors Group").property("ADBE Vector Group").property("ADBE Vectors Group").property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Roundness").value;
        var shape = new Shape();
        if (roundness === 0) {
            shape.vertices = [
                [-halfWidth, -halfHeight],
                [halfWidth, -halfHeight],
                [halfWidth, halfHeight],
                [-halfWidth, halfHeight]];
        } else {
            shape.vertices = [
                [-halfWidth, -halfHeight + roundness],
                [-halfWidth + roundness, -halfHeight],
                [halfWidth - roundness, -halfHeight],
                [halfWidth, -halfHeight + roundness],
                [halfWidth, halfHeight - roundness],
                [halfWidth - roundness, halfHeight],
                [-halfWidth + roundness, halfHeight],
                [-halfWidth, halfHeight - roundness]];
            var tangentDistance = this.tangentDistance(roundness);
            shape.inTangents = [
                [0, 0], [-tangentDistance, 0],
                [0, 0], [0, -tangentDistance],
                [0, 0], [tangentDistance, 0],
                [0, 0], [0, tangentDistance]];
            shape.outTangents = [
                [0, -tangentDistance], [0, 0],
                [tangentDistance, 0], [0, 0],
                [0, tangentDistance], [0, 0],
                [-tangentDistance, 0], [0, 0]];
        }
        shape.closed = true;
        return shape;
    };

    Script.prototype.createBezierEllipseShape = function (basicValues) {
        var xRadius = basicValues.width / 2;
        var yRadius = basicValues.height / 2;
        var horizontalTangentDistance = this.tangentDistance(xRadius);
        var verticalTangentDistance = this.tangentDistance(yRadius);
        var shape = new Shape();
            shape.vertices = [
                [0, -yRadius],
                [xRadius, 0],
                [0, yRadius],
                [-xRadius, 0]];
            shape.inTangents = [
                [-horizontalTangentDistance, 0],
                [0, -verticalTangentDistance],
                [horizontalTangentDistance, 0],
                [0, verticalTangentDistance]];
            shape.outTangents = [
                [horizontalTangentDistance, 0],
                [0, verticalTangentDistance],
                [-horizontalTangentDistance, 0],
                [0, -verticalTangentDistance]];
            shape.closed = true;
        return shape;
    };

    Script.prototype.createBezierShapeGroup = function (layer, shapeLayer, shapeType, basicValues) {
        var vectorGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
        var vectorsGroup = vectorGroup.addProperty("ADBE Vectors Group");
        var shapeGroup = vectorsGroup.addProperty("ADBE Vector Shape - Group");
        var shapePath = shapeGroup.property("ADBE Vector Shape");
        if (shapeType === "Rect") {
            var shape = this.createBezierRectangleShape(layer, basicValues);
        } else if (shapeType === "Ellipse") {
            var shape = this.createBezierEllipseShape(basicValues);
        }
        shapePath.setValue(shape);
        return vectorGroup;
    };

    Script.prototype.createNewBezierShape = function (comp, layer, shapeType) {
        var styleValues = this.getStyleValues(layer);
        var basicValues = this.getBasicValues(layer);
        var shapeLayer = comp.layers.addShape();
            shapeLayer.property("ADBE Transform Group").property("ADBE Position").setValue(basicValues.position);
        var shapeGroup = this.createBezierShapeGroup(layer, shapeLayer, shapeType, basicValues);
        if (styleValues.stroke !== false) {
            var stroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
            this.setStrokeValues(stroke, styleValues);
        }
        if (styleValues.fill !== false) {
            var fill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
            this.setFillValues(fill, styleValues);
        }
        return shapeLayer;
    };

    Script.prototype.createBezierShape = function (shape) {
        try {
            app.beginUndoGroup("Conver to bezier " + shape);
            var comp = this.getActiveComp();
            var layers = this.getSelectedLayers(comp);
            var numLayers = layers.length;
            for (var l = 0; l < numLayers; l++) {
                var layer = layers[l];
                var shapeType = (shape === "rectangle") ? "Rect" : "Ellipse";
                var shapeLayer = this.createNewBezierShape(comp, layer, shapeType);
                    shapeLayer.moveBefore(layer);
                    shapeLayer.name = layer.name;
                    shapeLayer.label = layer.label;
                    shapeLayer.selected = false;
                layer.remove();
            }
        } catch(err) {
            alert(err);
        } finally {
            app.endUndoGroup();
        }
    };

    /*************************************************************************
     *************************************************************************
     *************************************************************************/
    var script = new Script(thisObj);
    if (typeof kbar !== "undefined" && kbar.button) {
        var kbarArgument = kbar.button.argument;
        switch (kbarArgument.toLowerCase()) {
            case "parametric rectangle":
                script.createParametricShape("rectangle");
                break;
            case "parametric circle":
                script.createParametricShape("circle");
                break;
            case "bezier rectangle":
                script.createBezierShape("rectangle");
                break;
            case "bezier circle":
                script.createBezierShape("circle");
                break;
            case "help":
                script.openSettingsWindow();
                break;
            default:
                alert("Convert Shapes\nInvalid argument. Valid arguments are: \n\nparametric rectangle\nparametric circle\nbezier rectangle\nbezier circle\nhelp\n\nPlease check your KBar settings.");
                break;
        }
    } else {
        script.init();
    }

})(this);