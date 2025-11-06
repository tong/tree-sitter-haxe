package test.allfeatures;

import haxe.ds.Map;
import haxe.macro.Expr;
import test.utils as tu;

using StringTools;

@:build(MacroBuilder.build())
@:keep
class AllFeatures<T:Dynamic> implements ITestable implements haxe.extern.IExtern {
	static inline var VERSION:String = "1.0.0";
	static public final PI:Float = 3.14159;

	var x:Int;

	public var y:Float = 1.23;

	private var data:Array<T>;

	@:isVar public var name(get, set):String;

	public function new(?x:Int = 0, ?arr:Array<T> = null) {
		this.x = x;
		data = arr ?? [];
	}

	function get_name()
		return name;

	function set_name(v:String)
		return name = v.trim();

	public inline function add(a:T):Void
		data.push(a);

	public function sum(?mult:Float = 1.0):Float {
		var total = 0.0;
		for (v in data)
			if (Std.isOfType(v, Float))
				total += cast v;
		return total * mult;
	}

	public function complexExpressions():Void {
		var arr = [1, 2, 3];
		var map = ["a" => 1, "b" => 2];
		var lambda = (x:Int, y:Int) -> x + y;
		var cond = x > 10 ? "big" : "small";
		var s = 'Value: ${x}, len=${arr.length}';
		var regex = ~/foo|bar/gi;
		var dyn:Dynamic = {field: 42, nested: {ok: true}};
		var any:Any = cast dyn;
		var f = (v:Int) -> switch v {
			case 0: "zero";
			case 1 | 2: "small";
			case n if (n > 10): "big";
			default: "other";
		};
		trace(f(5));
		trace(Type.typeof(this));
	}

	public function controlFlow():Void {
		var i = 0;
		while (i < 3) {
			if (i == 1)
				continue;
			trace(i++);
		}
		do {
			trace("loop");
		} while (false);

		try {
			throw "error";
		} catch (e:String) {
			trace('Caught $e');
		} catch (e) {
			trace("Unknown error");
		}
	}

	@:generic
	public inline function genericFunc<U>(v:U):String {
		return 'generic ${Std.string(v)}';
	}

	public macro static function exampleMacro(e:Expr):Expr {
		return macro trace("macro called");
	}
}

interface ITestable {
	public function sum(?mult:Float = 1.0):Float;
}

enum Color {
	Red;
	Green(value:Int);
	Blue(name:String, ?alpha:Float);
}

@:some
enum abstract Direction(Int) from Int to Int {
	var Up = 0;
	var Down = 1;
	var Left = 2;
	var Right = 3;

	inline function isVertical()
		return this == Up || this == Down;
}

typedef User = {
	> ExtraFields,
	var id:Int;
	@:optional var name:String;
}

typedef ExtraFields = {
	var active:Bool;
}

@:structAccess
abstract Vec2({x:Float, y:Float}) {
	public inline function new(x:Float, y:Float)
		this = {x: x, y: y};

	public inline function length()
		return Math.sqrt(this.x * this.x + this.y * this.y);

	@:op(A + B) static inline function add(a:Vec2, b:Vec2)
		return new Vec2(a.x + b.x, a.y + b.y);
}

enum abstract State(String) {
	var Idle = "idle";
	var Running = "run";
	var Stopped = "stop";
}

class TestModuleLevel {
	public static function main() {
		var obj = new AllFeatures<Float>(1, [1.0, 2.0, 3.0]);
		trace(obj.sum());
		obj.complexExpressions();
		obj.controlFlow();

		var dir:Direction = Direction.Left;
		trace(dir.isVertical());
		var v = new Vec2(1, 2) + new Vec2(3, 4);
		trace(v.length());
	}
}
