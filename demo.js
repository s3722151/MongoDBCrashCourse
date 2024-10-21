//https://youtu.be/fbYExfeFsI0 
//To connect to MongoDB database
const { MongoClient } = require('mongodb');

//Step 1: We want to connect to cluster, call functions that query db, disconnect cluster
async function main() {
    const uri = 'mongodb+srv://s3722151:Gatesea3@assignment3cluster.kbysd.mongodb.net/';

    //Create instance of mongo
    const client = new MongoClient(uri);

    try {
        //connect to cluster. We wait until the operation is complete.
        await client.connect();

        //2.This calls function to list databases
        // await listDatabases(client);
        
        //3.Creates a listing 
        // await createListing(client, {
        //     name: "Artoria",
        //     summary: "A charming loft in Paris",
        //     bedrooms: 1,
        //     bathrooms:1    
        // })
        
        //4.Create multiple listings
        // await createMultipleListings(client, [
        //     {
        //         name: "Infinite Views",
        //         summary: "Modern home with infinite views from the infinity pool",
        //         property_type: "House",
        //         bedrooms: 5,
        //         bathrooms: 4.5,
        //         beds: 5
        //     },
        //     {
        //         name: "Private room in London",
        //         property_type: "Apartment",
        //         bedrooms: 1,
        //         bathroom: 1
        //     },
        //     {
        //         name: "Beuatiful Beach House",
        //         summary: "Enjoy relaxed beach living in this house with a private beach",
        //         bedrooms: 4,
        //         bathrooms: 2.5,
        //         beds: 7,
        //         last_review: new Date()
        //     }
        // ]);
        
        //5. Find one listing 
        await findOndListingByName(client, "Infinite Views");
        
        //6.Find Many Listings
        // await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
        //     minimumNumberOfBedrooms: 4,
        //     minimumNumberOfBathrooms: 2,
        //     maximumNumberOfResults: 5
        // });
        
        //7. Update 1 document 
        // await updateListingByName(client, "Infinite Views", { bedrooms: 6, beds: 8 });
        
        //8. Upsert Update a document or cerate if it doesn't exist
        // await upsertListingByName(client, "Cozy Cottage", { name: "Cozy Cottage",
        //     bedrooms: 2, bathrooms: 2
        // });
        
        //9. Updating multiple documents
        // await updateAllListingsToHavePropertyType(client);
        
        //10. Delete 1 document 
        // await deleteListingByName(client,"Cozy Cottage");
        
        //11. Delete many documents
        // await deleteListingScrappedBeforeDate(client,new Date())

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    
}
//This calls function, but also send an error to catch
main().catch(console.error);

//Step 2: List databases in out cluster 
async function listDatabases(client) {
    //Assign variable that gets databases 
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases");
    databasesList.databases.forEach(db => {
        console.log(`-${db.name}`);
    })
}

//Step 3: How to create 1 documents
async function createListing(client, newListing) {
    //Create variable, Wait & Look at the database then collection
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);

    console.log(`New listing createed with the following id: ${result.insertedId}`);
}

//4. Create many documents 
async function createMultipleListings(client, newListings) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);

    //insertedCount is how many
    console.log(`${result.insertedCount} new listings created with the following id (s):`);
    console.log(result.insertedIds);
    
}
//5/Read documents
//client refers to MongoDB
async function findOndListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing });
    //If found result
    if (result) {
        console.log(`Found a listing in the collection withthe name '${nameOfListing}'`);
        console.log(result);
    } else {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}

//6. Find multiple documents
async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    //Here these are de-structured parameters
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
}={}){
    //We use find to look at multiple documents
    const cursor = await client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms: { $gte: minimumNumberOfBedrooms },
        bathrooms: { $gte: minimumNumberOfBathrooms }
    }).sort({ last_review: -1 })
        .limit(maximumNumberOfResults);
    
    const results = await cursor.toArray();

    if (results.length > 0) {
        console.log(`Found listings(s) with at least ${minimumNumberOfBedrooms} 
        bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`  _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${new Date(result.last_review).
                toDateString()}`);

        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} 
        bedrooms and ${minimumNumberOfBathrooms}`);
    }

}

//7.Updating a document
async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name:
        nameOfListing
    }, { $set: updatedListing });
    
    console.log(`${result.matchedCount} documents(s) matched the query criteria`);
    console.log(`${result.modifiedCount} documents was/were updated`);
}

//8. Upsert 
    //Client refers to MongoDB client
async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
    .updateOne({name: nameOfListing}, { $set: updatedListing }, {upsert:true});
    
    console.log(`${result.matchedCount} document(s) matched the query criteria`);

    if (result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId}`);
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated`);
    }
}

//9. Update more than one field
async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({
        property_type: { $exists: false } },
        { $set: { property_type: "Unknown" } });
    
    //Find how many documents match our filter
    console.log(`${result.matchedCount} documents(s) matched the query criteria`);
    //Log how many were actually updated
    console.log(`${result.modifiedCount} document(s) was/were updated`);
    
}

//10. Delete 1 document
async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
    .deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted`);    
}
//11.Delete many documents
async function deleteListingScrappedBeforeDate(client, date) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany(
        { "last_scrapped": { $lt: date } });
    
    console.log(`${result.deletedCount} document(s) was/were deleted`);
}