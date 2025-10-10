package examples;

import haxe.Timer;

@:keep
class Main {
  static function main() {
    trace("Hello from Haxe!");

    var p = new Point<Float>(3.5, 7.2);
    trace(p);

    var color = Color.Red;
    switch (color) {
      case Red: trace("Color is red");
      case Green: trace("Color is green");
      case Blue: trace("Color is blue");
    }

    var user = { name: "Alice", age: 30 };
    trace('User: ${user.name} (${user.age})');

    for (i in 0...5)
      trace('i = $i');

    var nums = [1, 2, 3, 4];
    var doubled = nums.map(n -> n * 2);
    trace(doubled);

    var now = Timer.stamp();
    trace('Timestamp: $now');
  }
}

class Point<T:Float> {
  public var x:T;
  public var y:T;

  public function new(x:T, y:T) {
    this.x = x;
    this.y = y;
  }

  public function toString():String {
    return 'Point($x, $y)';
  }
}

enum Color {
  Red;
  Green;
  Blue;
}

typedef User = {
  var name:String;
  var age:Int;
}
