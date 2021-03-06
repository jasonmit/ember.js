import { get } from 'ember-metal';
import { SuiteModuleBuilder } from '../suite';
import { A as emberA } from '../../../system/native_array';

const suite = SuiteModuleBuilder.create();

suite.module('removeObject');

suite.test('should return receiver', function(assert) {
  let before = this.newFixture(3);
  let obj    = this.newObject(before);

  assert.equal(obj.removeObject(before[1]), obj, 'should return receiver');
});

suite.test('[A,B,C].removeObject(B) => [A,C] + notify', function(assert) {
  let before = emberA(this.newFixture(3));
  let after  = [before[0], before[2]];
  let obj = before;
  let observer = this.newObserver(obj, '[]', 'length', 'firstObject', 'lastObject');

  obj.getProperties('firstObject', 'lastObject'); // Prime the cache

  obj.removeObject(before[1]);

  assert.deepEqual(this.toArray(obj), after, 'post item results');
  assert.equal(get(obj, 'length'), after.length, 'length');

  if (observer.isEnabled) {
    assert.equal(observer.timesCalled('[]'), 1, 'should have notified [] once');
    assert.equal(observer.timesCalled('length'), 1, 'should have notified length once');

    assert.equal(observer.validate('firstObject'), false, 'should NOT have notified firstObject');
    assert.equal(observer.validate('lastObject'), false, 'should NOT have notified lastObject');
  }
});

suite.test('[A,B,C].removeObject(D) => [A,B,C]', function(assert) {
  let before = emberA(this.newFixture(3));
  let after  = before;
  let item   = this.newFixture(1)[0];
  let obj = before;
  let observer = this.newObserver(obj, '[]', 'length', 'firstObject', 'lastObject');

  obj.getProperties('firstObject', 'lastObject'); // Prime the cache

  obj.removeObject(item); // Note: item not in set

  assert.deepEqual(this.toArray(obj), after, 'post item results');
  assert.equal(get(obj, 'length'), after.length, 'length');

  if (observer.isEnabled) {
    assert.equal(observer.validate('[]'), false, 'should NOT have notified []');
    assert.equal(observer.validate('length'), false, 'should NOT have notified length');

    assert.equal(observer.validate('firstObject'), false, 'should NOT have notified firstObject');
    assert.equal(observer.validate('lastObject'), false, 'should NOT have notified lastObject');
  }
});

suite.test('Removing object should notify enumerable observer', function(assert) {
  let fixtures = this.newFixture(3);
  let obj = this.newObject(fixtures);
  let observer = this.newObserver(obj).observeEnumerable(obj);
  let item = fixtures[1];

  obj.removeObject(item);

  assert.deepEqual(observer._before, [obj, [item], null]);
  assert.deepEqual(observer._after, [obj, [item], null]);
});

export default suite;
