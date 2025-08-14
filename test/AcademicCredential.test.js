const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AcademicCredential", function () {
    let academicCredential;
    let owner;
    let university;
    let student;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, university, student, addr1, addr2] = await ethers.getSigners();
        
        const AcademicCredential = await ethers.getContractFactory("AcademicCredential");
        academicCredential = await AcademicCredential.deploy();
        await academicCredential.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await academicCredential.owner()).to.equal(owner.address);
        });

        it("Should set the owner as authorized university", async function () {
            expect(await academicCredential.authorizedUniversities(owner.address)).to.equal(true);
        });

        it("Should have correct name and symbol", async function () {
            expect(await academicCredential.name()).to.equal("Academic Credential");
            expect(await academicCredential.symbol()).to.equal("ACRED");
        });
    });

    describe("University Authorization", function () {
        it("Should allow owner to authorize university", async function () {
            await academicCredential.authorizeUniversity(university.address, true);
            expect(await academicCredential.authorizedUniversities(university.address)).to.equal(true);
        });

        it("Should allow owner to revoke university authorization", async function () {
            await academicCredential.authorizeUniversity(university.address, true);
            await academicCredential.authorizeUniversity(university.address, false);
            expect(await academicCredential.authorizedUniversities(university.address)).to.equal(false);
        });

        it("Should not allow non-owner to authorize university", async function () {
            await expect(
                academicCredential.connect(addr1).authorizeUniversity(university.address, true)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should emit UniversityAuthorized event", async function () {
            await expect(academicCredential.authorizeUniversity(university.address, true))
                .to.emit(academicCredential, "UniversityAuthorized")
                .withArgs(university.address, true);
        });
    });

    describe("Credential Issuance", function () {
        beforeEach(async function () {
            await academicCredential.authorizeUniversity(university.address, true);
        });

        it("Should allow authorized university to issue credential", async function () {
            const credentialData = {
                student: student.address,
                studentName: "John Doe",
                degreeType: "Bachelor",
                fieldOfStudy: "Computer Science",
                university: "MIT",
                graduationDate: Math.floor(Date.now() / 1000),
                ipfsHash: "QmTestHash123"
            };

            await expect(
                academicCredential.connect(university).issueCredential(
                    credentialData.student,
                    credentialData.studentName,
                    credentialData.degreeType,
                    credentialData.fieldOfStudy,
                    credentialData.university,
                    credentialData.graduationDate,
                    credentialData.ipfsHash
                )
            ).to.emit(academicCredential, "CredentialIssued");

            const tokenId = 1;
            expect(await academicCredential.ownerOf(tokenId)).to.equal(student.address);
            
            const credential = await academicCredential.getCredential(tokenId);
            expect(credential.studentName).to.equal(credentialData.studentName);
            expect(credential.degreeType).to.equal(credentialData.degreeType);
            expect(credential.university).to.equal(credentialData.university);
        });

        it("Should not allow unauthorized university to issue credential", async function () {
            const credentialData = {
                student: student.address,
                studentName: "John Doe",
                degreeType: "Bachelor",
                fieldOfStudy: "Computer Science",
                university: "MIT",
                graduationDate: Math.floor(Date.now() / 1000),
                ipfsHash: "QmTestHash123"
            };

            await expect(
                academicCredential.connect(addr1).issueCredential(
                    credentialData.student,
                    credentialData.studentName,
                    credentialData.degreeType,
                    credentialData.fieldOfStudy,
                    credentialData.university,
                    credentialData.graduationDate,
                    credentialData.ipfsHash
                )
            ).to.be.revertedWith("Not authorized university");
        });

        it("Should not allow issuing credential to zero address", async function () {
            const credentialData = {
                student: ethers.constants.AddressZero,
                studentName: "John Doe",
                degreeType: "Bachelor",
                fieldOfStudy: "Computer Science",
                university: "MIT",
                graduationDate: Math.floor(Date.now() / 1000),
                ipfsHash: "QmTestHash123"
            };

            await expect(
                academicCredential.connect(university).issueCredential(
                    credentialData.student,
                    credentialData.studentName,
                    credentialData.degreeType,
                    credentialData.fieldOfStudy,
                    credentialData.university,
                    credentialData.graduationDate,
                    credentialData.ipfsHash
                )
            ).to.be.revertedWith("Invalid student address");
        });

        it("Should not allow empty student name", async function () {
            const credentialData = {
                student: student.address,
                studentName: "",
                degreeType: "Bachelor",
                fieldOfStudy: "Computer Science",
                university: "MIT",
                graduationDate: Math.floor(Date.now() / 1000),
                ipfsHash: "QmTestHash123"
            };

            await expect(
                academicCredential.connect(university).issueCredential(
                    credentialData.student,
                    credentialData.studentName,
                    credentialData.degreeType,
                    credentialData.fieldOfStudy,
                    credentialData.university,
                    credentialData.graduationDate,
                    credentialData.ipfsHash
                )
            ).to.be.revertedWith("Student name cannot be empty");
        });

        it("Should not allow empty degree type", async function () {
            const credentialData = {
                student: student.address,
                studentName: "John Doe",
                degreeType: "",
                fieldOfStudy: "Computer Science",
                university: "MIT",
                graduationDate: Math.floor(Date.now() / 1000),
                ipfsHash: "QmTestHash123"
            };

            await expect(
                academicCredential.connect(university).issueCredential(
                    credentialData.student,
                    credentialData.studentName,
                    credentialData.degreeType,
                    credentialData.fieldOfStudy,
                    credentialData.university,
                    credentialData.graduationDate,
                    credentialData.ipfsHash
                )
            ).to.be.revertedWith("Degree type cannot be empty");
        });

        it("Should increment token ID for each credential", async function () {
            const credentialData = {
                student: student.address,
                studentName: "John Doe",
                degreeType: "Bachelor",
                fieldOfStudy: "Computer Science",
                university: "MIT",
                graduationDate: Math.floor(Date.now() / 1000),
                ipfsHash: "QmTestHash123"
            };

            await academicCredential.connect(university).issueCredential(
                credentialData.student,
                credentialData.studentName,
                credentialData.degreeType,
                credentialData.fieldOfStudy,
                credentialData.university,
                credentialData.graduationDate,
                credentialData.ipfsHash
            );

            await academicCredential.connect(university).issueCredential(
                addr1.address,
                "Jane Smith",
                "Master",
                "Physics",
                "Stanford",
                Math.floor(Date.now() / 1000),
                "QmTestHash456"
            );

            expect(await academicCredential.ownerOf(1)).to.equal(student.address);
            expect(await academicCredential.ownerOf(2)).to.equal(addr1.address);
        });
    });

    describe("Credential Verification", function () {
        let tokenId;
        let credentialData;

        beforeEach(async function () {
            await academicCredential.authorizeUniversity(university.address, true);
            
            credentialData = {
                student: student.address,
                studentName: "John Doe",
                degreeType: "Bachelor",
                fieldOfStudy: "Computer Science",
                university: "MIT",
                graduationDate: Math.floor(Date.now() / 1000),
                ipfsHash: "QmTestHash123"
            };

            const tx = await academicCredential.connect(university).issueCredential(
                credentialData.student,
                credentialData.studentName,
                credentialData.degreeType,
                credentialData.fieldOfStudy,
                credentialData.university,
                credentialData.graduationDate,
                credentialData.ipfsHash
            );
            
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'CredentialIssued');
            tokenId = event.args.tokenId;
        });

        it("Should return correct credential data", async function () {
            const credential = await academicCredential.getCredential(tokenId);
            
            expect(credential.studentName).to.equal(credentialData.studentName);
            expect(credential.degreeType).to.equal(credentialData.degreeType);
            expect(credential.fieldOfStudy).to.equal(credentialData.fieldOfStudy);
            expect(credential.university).to.equal(credentialData.university);
            expect(credential.graduationDate).to.equal(credentialData.graduationDate);
            expect(credential.ipfsHash).to.equal(credentialData.ipfsHash);
            expect(credential.isRevoked).to.equal(false);
            expect(credential.issuedAt).to.be.gt(0);
        });

        it("Should return true for valid credential", async function () {
            expect(await academicCredential.isCredentialValid(tokenId)).to.equal(true);
        });

        it("Should return false for non-existent credential", async function () {
            await expect(academicCredential.getCredential(999)).to.be.revertedWith("Credential does not exist");
            expect(await academicCredential.isCredentialValid(999)).to.equal(false);
        });

        it("Should return student's credentials", async function () {
            const credentials = await academicCredential.getStudentCredentials(student.address);
            expect(credentials.length).to.equal(1);
            expect(credentials[0]).to.equal(tokenId);
        });

        it("Should return empty array for student with no credentials", async function () {
            const credentials = await academicCredential.getStudentCredentials(addr1.address);
            expect(credentials.length).to.equal(0);
        });
    });

    describe("Credential Revocation", function () {
        let tokenId;

        beforeEach(async function () {
            await academicCredential.authorizeUniversity(university.address, true);
            
            const tx = await academicCredential.connect(university).issueCredential(
                student.address,
                "John Doe",
                "Bachelor",
                "Computer Science",
                "MIT",
                Math.floor(Date.now() / 1000),
                "QmTestHash123"
            );
            
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'CredentialIssued');
            tokenId = event.args.tokenId;
        });

        it("Should allow authorized university to revoke credential", async function () {
            await expect(
                academicCredential.connect(university).revokeCredential(tokenId, "Academic misconduct")
            ).to.emit(academicCredential, "CredentialRevoked");

            expect(await academicCredential.revokedCredentials(tokenId)).to.equal(true);
            expect(await academicCredential.isCredentialValid(tokenId)).to.equal(false);
            
            const credential = await academicCredential.getCredential(tokenId);
            expect(credential.isRevoked).to.equal(true);
        });

        it("Should not allow unauthorized university to revoke credential", async function () {
            await expect(
                academicCredential.connect(addr1).revokeCredential(tokenId, "Academic misconduct")
            ).to.be.revertedWith("Not authorized university");
        });

        it("Should not allow revoking already revoked credential", async function () {
            await academicCredential.connect(university).revokeCredential(tokenId, "Academic misconduct");
            
            await expect(
                academicCredential.connect(university).revokeCredential(tokenId, "Another reason")
            ).to.be.revertedWith("Credential already revoked");
        });

        it("Should not allow revoking non-existent credential", async function () {
            await expect(
                academicCredential.connect(university).revokeCredential(999, "Academic misconduct")
            ).to.be.revertedWith("Credential does not exist");
        });

        it("Should emit CredentialRevoked event", async function () {
            await expect(academicCredential.connect(university).revokeCredential(tokenId, "Academic misconduct"))
                .to.emit(academicCredential, "CredentialRevoked")
                .withArgs(tokenId, "Academic misconduct");
        });
    });

    describe("Token URI", function () {
        let tokenId;

        beforeEach(async function () {
            await academicCredential.authorizeUniversity(university.address, true);
            
            const tx = await academicCredential.connect(university).issueCredential(
                student.address,
                "John Doe",
                "Bachelor",
                "Computer Science",
                "MIT",
                Math.floor(Date.now() / 1000),
                "QmTestHash123"
            );
            
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'CredentialIssued');
            tokenId = event.args.tokenId;
        });

        it("Should return correct token URI", async function () {
            const uri = await academicCredential.tokenURI(tokenId);
            expect(uri).to.equal("https://ipfs.io/ipfs/QmTestHash123");
        });

        it("Should revert for non-existent token", async function () {
            await expect(academicCredential.tokenURI(999)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
        });
    });

    describe("Edge Cases", function () {
        it("Should handle multiple credentials for same student", async function () {
            await academicCredential.authorizeUniversity(university.address, true);
            
            // Issue first credential
            await academicCredential.connect(university).issueCredential(
                student.address,
                "John Doe",
                "Bachelor",
                "Computer Science",
                "MIT",
                Math.floor(Date.now() / 1000),
                "QmTestHash123"
            );

            // Issue second credential
            await academicCredential.connect(university).issueCredential(
                student.address,
                "John Doe",
                "Master",
                "Computer Science",
                "MIT",
                Math.floor(Date.now() / 1000),
                "QmTestHash456"
            );

            const credentials = await academicCredential.getStudentCredentials(student.address);
            expect(credentials.length).to.equal(2);
        });

        it("Should handle multiple universities", async function () {
            await academicCredential.authorizeUniversity(university.address, true);
            await academicCredential.authorizeUniversity(addr1.address, true);
            
            // Issue credential from first university
            await academicCredential.connect(university).issueCredential(
                student.address,
                "John Doe",
                "Bachelor",
                "Computer Science",
                "MIT",
                Math.floor(Date.now() / 1000),
                "QmTestHash123"
            );

            // Issue credential from second university
            await academicCredential.connect(addr1).issueCredential(
                addr2.address,
                "Jane Smith",
                "Master",
                "Physics",
                "Stanford",
                Math.floor(Date.now() / 1000),
                "QmTestHash456"
            );

            const mitCredentials = await academicCredential.getStudentCredentials(student.address);
            const stanfordCredentials = await academicCredential.getStudentCredentials(addr2.address);
            
            expect(mitCredentials.length).to.equal(1);
            expect(stanfordCredentials.length).to.equal(1);
        });
    });
});
