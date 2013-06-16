/* Zza/Breeze Web API save */
describe('Zza/Breeze web api', function(){
    'use strict';
    var testFns = zzaTestFns;
    var breezeTest = testFns.breezeTest;
    var newEm = testFns.newEm;
    var reset = testFns.zzaReset;
    var EntityQuery = breeze.EntityQuery;

    var async = new AsyncSpec(this);
    var xasync = testFns.xasync;

    describe('when unauthorized to save type', function() {

        async.it("should not save new Product", function (done){

            breezeTest(test, done);

            function test(){
                var em = newEm();
                var product = em.createEntity('Product', {
                    type: 'pizza',
                    name: 'The Gordo',
                    description: 'Too much pizza for anyone',
                    hasOptions: true
                })

                return em.saveChanges().then(success).fail(fail);
            }
            function success(data){
                //console.log('** new product was saved?!');
                expect().toFail('save of new product should not have succeeded');
            }
            function fail(error){
                var emsg = error.message;
                var re = /not authorized to save/i;
                //console.log('save of new product failed (as it should) with error: "' + emsg + '"');
                expect(emsg).toRegExMatch(re);
            }
        });

        async.it("should not save deleted Product", function (done){
            var em;
            breezeTest(test, done);

            function test(){
                em = newEm();
                return EntityQuery.from('Products').take(1)
                    .using(em).execute().then(deleteAndSave);
            }

            function deleteAndSave(data){
                var product = data.results[0];
                product.entityAspect.setDeleted();
                var stateName = product.entityAspect.entityState.name;
                expect(stateName).toEqual('Deleted');
                return em.saveChanges().then(success).fail(fail);
            }
            function success(data){
                //console.log('** deleted product was saved?!');
                expect().toFail('save of deleted product should not have succeeded');
            }
            function fail(error){
                var emsg = error.message;
                var re = /not authorized to save/i;
                //console.log('save of deleted product failed (as it should) with error: "' + emsg + '"');
                expect(emsg).toRegExMatch(re);
            }
        });

        async.it("should not save updated Product", function (done){
        var em;
        breezeTest(test, done);

        function test(){
            em = newEm();
            return EntityQuery.from('Products').take(1)
                .using(em).execute().then(updateAndSave);
        }

        function updateAndSave(data){
            var product = data.results[0];
            product.name = "** TEST PRODUCT **";
            var stateName = product.entityAspect.entityState.name;
            expect(stateName).toEqual('Modified');
            return em.saveChanges().then(success).fail(fail);
        }
        function success(data){
            //console.log('** updated product was saved?!');
            expect().toFail('save of updated product should not have succeeded');
        }
        function fail(error){
            var emsg = error.message;
            var re = /not authorized to save/i;
            //console.log('save of modified product failed (as it should) with error: "' + emsg + '"');
            expect(emsg).toRegExMatch(re);
        }
    });
    });

    describe('when trying to save original instances', function() {
        async.it("should not save updated customer", function (done){
            var em;
            breezeTest(test, done);

            function test(){
                em = newEm();
                return EntityQuery.from('Customers')
                    // A base customer when storeId is null
                    // storeId is in metadata but not serialized!
                    .where("storeId", "eq", null).take(1)
                    .using(em).execute().then(updateAndSave);
            }

            function updateAndSave(data){
                var customer = data.results[0];
                customer.firstName = "** TEST FNAME **";
                var stateName = customer.entityAspect.entityState.name;
                expect(stateName).toEqual('Modified');
                return em.saveChanges().then(success).fail(fail);
            }
            function success(data){
                //console.log('** updated base customer was saved?!');
                expect().toFail('save of updated base customer should not have succeeded');
            }
            function fail(error){
                var emsg = error.message;
                var re = /original entity may not be saved/i;
                //console.log('save of base customer failed (as it should) with error: "' + emsg + '"');
                expect(emsg).toRegExMatch(re);
            }
        });

        async.it("should not save deleted customer", function (done){
            var em;
            breezeTest(test, done);

            function test(){
                em = newEm();
                return EntityQuery.from('Customers')
                    // A base customer when storeId is null
                    // storeId is in metadata but not serialized!
                    .where("storeId", "eq", null).take(1)
                    .using(em).execute().then(deleteAndSave);
            }

            function deleteAndSave(data){
                var customer = data.results[0];
                customer.entityAspect.setDeleted();
                var stateName = customer.entityAspect.entityState.name;
                expect(stateName).toEqual('Deleted');
                return em.saveChanges().then(success).fail(fail);
            }
            function success(data){
                //console.log('** deleted base customer was saved?!');
                expect().toFail('save of deleted base customer should not have succeeded');
            }
            function fail(error){
                var emsg = error.message;
                var re = /original entity may not be saved/i;
                //console.log('save of base customer failed (as it should) with error: "' + emsg + '"');
                expect(emsg).toRegExMatch(re);
            }
        });
    });

    describe('when saving own instances', function() {
        var customerId =  testFns.newGuidComb();

        async.it("can save new Customer", function (done){
            var customer;
            var em;
            breezeTest(test, done);

            function test(){
                em = newEm();
                customer = em.createEntity('Customer', {
                    id: customerId, firstName: 'TEST', lastName:'Dude' })
                return em.saveChanges().then(createSuccess).then(reset);
            }
            function createSuccess(saveResult){
                var saved = saveResult.entities[0];
                expect(saved).toBe(customer);
                expect(saved.id).toEqual(customerId);
                var stateName = customer.entityAspect.entityState.name;
                expect(stateName).toEqual('Unchanged');
            }
        });

        async.it("can save updated Customer", function (done){
            var customer;
            var em;
            breezeTest(test, done);

            function test(){
                em = newEm();
                customer = em.createEntity('Customer', {
                    id: customerId, firstName: 'TEST', lastName:'Dude' })
                return em.saveChanges().then(createSuccess).fin(reset);
            }
            function createSuccess(saveResult){
                customer.lastName = 'Sobchak';
                var stateName = customer.entityAspect.entityState.name;
                expect(stateName).toEqual('Modified');
                return em.saveChanges().then(modSuccess);
            }
            function modSuccess(saveResult){
                var stateName = customer.entityAspect.entityState.name;
                expect(stateName).toEqual('Unchanged');
            }
        });
    }) ;
});
