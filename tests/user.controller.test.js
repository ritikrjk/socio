const userController = require('../src/controllers/user.controller');
const User = require('../src/models/user.model');

jest.mock('../src/models/user.model');

describe('User Controller', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getUserData', () => {
    it('should return 404 if req.user is missing', async () => {
      const req = { user: undefined };
      await userController.getUserData(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('User data not found') });
    });

    it('should return user data if req.user exists', async () => {
      const req = { user: { _id: '123', nameFirst: 'Test' } };
      await userController.getUserData(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: req.user });
    });
  });

  describe('getUserById', () => {
    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);
      const req = { params: { id: 'notfound' } };
      await userController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return user if found', async () => {
      const fakeUser = { _id: '123', nameFirst: 'Test' };
      User.findById.mockResolvedValue(fakeUser);
      const req = { params: { id: '123' } };
      await userController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: fakeUser });
    });
  });

  describe('updateUserProfile', () => {
    it('should return 400 if no valid fields provided', async () => {
      const req = { user: { _id: '123' }, body: { invalid: 'field' } };
      await userController.updateUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No valid fields provided for update.' });
    });

    it('should return 404 if user not found', async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);
      const req = { user: { _id: '123' }, body: { nameFirst: 'New' } };
      await userController.updateUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
    });

    it('should update and return user if valid', async () => {
      const updatedUser = { toObject: () => ({ _id: '123', nameFirst: 'New' }) };
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);
      const req = { user: { _id: '123' }, body: { nameFirst: 'New' } };
      await userController.updateUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated successfully.', user: { _id: '123', nameFirst: 'New' } });
    });
  });
}); 