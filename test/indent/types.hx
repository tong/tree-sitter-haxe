package a;

import a.B;

/**
	A documented class.
**/
@:keep
class C extends B implements I {
	static var x:Int = 1;
	var o = {
		a: 1,
		b: [
			1,
			2,
		],
	};

	#if js
	var y:Int;
	#end

	public function new() {
		super();
	}

	function get()
		return x;
}

enum E {
	A;
	B(x:Int);
}

typedef T = {
	var a:Int;
	var ?b:String;
}

abstract A(Int) from Int to Int {
	public inline function new(i) {
		this = i;
	}
}

interface I {
	function f():Void;
}
